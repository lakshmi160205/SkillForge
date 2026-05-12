import exp from "express";
import Stripe from "stripe";
import { verifyToken } from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { PaymentModel } from "../models/PaymentModel.js";
import { CourseModel } from "../models/CourseModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";

const getStripeClient = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }
  return new Stripe(process.env.STRIPE_SECRET_KEY);
};

export const paymentRoute = exp.Router();

paymentRoute.use(verifyToken, authorizeRoles("STUDENT"));

const markEnrollmentPaid = async ({ studentId, courseId }) => {
  let enrollment = await EnrollmentModel.findOne({ studentId, courseId });

  if (!enrollment) {
    enrollment = await EnrollmentModel.create({
      studentId,
      courseId,
      paymentStatus: "PAID",
    });

    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { totalEnrollments: 1 },
    });
  } else if (enrollment.paymentStatus !== "PAID") {
    enrollment.paymentStatus = "PAID";
    enrollment.lastAccessedAt = new Date();
    await enrollment.save();

    await CourseModel.findByIdAndUpdate(courseId, {
      $inc: { totalEnrollments: 1 },
    });
  }

  return enrollment;
};

paymentRoute.post("/create-order", async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on server" });
    }

    const { courseId } = req.body;
    const studentId = req.user.userId;

    const course = await CourseModel.findById(courseId);
    if (!course || !course.isPublished) {
      return res.status(404).json({ message: "Published course not found" });
    }

    if (course.price <= 0) {
      return res.status(400).json({ message: "This course is free. Use enrollment directly." });
    }

    const existingEnrollment = await EnrollmentModel.findOne({ studentId, courseId });
    if (existingEnrollment && existingEnrollment.paymentStatus === "PAID") {
      return res.status(200).json({
        message: "Student already enrolled in this course",
        payload: existingEnrollment,
      });
    }

    const amountInPaise = Math.round(course.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInPaise,
      currency: "inr",
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: "never",
      },
      metadata: {
        studentId: studentId.toString(),
        courseId: courseId.toString(),
      },
    });

    await PaymentModel.create({
      studentId,
      courseId,
      orderId: paymentIntent.id,
      amount: course.price,
      currency: "INR",
      status: "PENDING",
    });

    res.status(200).json({
      message: "Payment order created",
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
});

paymentRoute.post("/verify", async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on server" });
    }

    const { paymentIntentId, courseId } = req.body;
    const studentId = req.user.userId;

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const matchesCourse = paymentIntent.metadata?.courseId === courseId;
    const matchesStudent = paymentIntent.metadata?.studentId === String(studentId);

    if (!matchesCourse || !matchesStudent) {
      return res.status(400).json({ message: "Payment intent does not match this enrollment" });
    }

    if (paymentIntent.status !== "succeeded") {
      await PaymentModel.findOneAndUpdate({ orderId: paymentIntentId }, { status: "FAILED" });
      return res.status(400).json({ message: "Payment not completed" });
    }

    await PaymentModel.findOneAndUpdate(
      { orderId: paymentIntentId },
      {
        status: "SUCCESS",
        paymentId: paymentIntent.id,
        paidAt: new Date(),
        $unset: { expiresAt: "" },
      },
    );

    const enrollment = await markEnrollmentPaid({ studentId, courseId });

    res.status(200).json({
      message: "Payment successful and enrollment completed",
      success: true,
      payload: enrollment,
    });
  } catch (err) {
    next(err);
  }
});

paymentRoute.post("/retry-verify", async (req, res, next) => {
  try {
    const stripe = getStripeClient();
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on server" });
    }

    const { courseId } = req.body;
    const studentId = req.user.userId;

    const latestPayment = await PaymentModel.findOne({
      studentId,
      courseId,
      status: { $in: ["PENDING", "SUCCESS"] },
    }).sort({ createdAt: -1 });

    if (!latestPayment) {
      return res.status(404).json({ message: "No payment record found for this course" });
    }

    if (latestPayment.status === "SUCCESS") {
      const enrollment = await markEnrollmentPaid({ studentId, courseId });
      return res.status(200).json({
        message: "Payment already successful. Enrollment synced.",
        success: true,
        payload: enrollment,
      });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(latestPayment.orderId);

    const matchesCourse = paymentIntent.metadata?.courseId === String(courseId);
    const matchesStudent = paymentIntent.metadata?.studentId === String(studentId);

    if (!matchesCourse || !matchesStudent) {
      return res.status(400).json({ message: "Payment intent does not match this enrollment" });
    }

    if (paymentIntent.status !== "succeeded") {
      const ageMs = Date.now() - new Date(latestPayment.createdAt).getTime();
      const fifteenMinutesMs = 15 * 60 * 1000;

      if (ageMs >= fifteenMinutesMs) {
        await PaymentModel.findByIdAndUpdate(latestPayment._id, {
          status: "FAILED",
        });
      }

      return res.status(400).json({
        message: "Payment is still not completed",
        stripeStatus: paymentIntent.status,
      });
    }

    await PaymentModel.findByIdAndUpdate(latestPayment._id, {
      status: "SUCCESS",
      paymentId: paymentIntent.id,
      paidAt: new Date(),
      $unset: { expiresAt: "" },
    });

    const enrollment = await markEnrollmentPaid({ studentId, courseId });

    res.status(200).json({
      message: "Payment verified and enrollment updated",
      success: true,
      payload: enrollment,
    });
  } catch (err) {
    next(err);
  }
});

paymentRoute.get("/my-payments", async (req, res, next) => {
  try {
    const payments = await PaymentModel.find({
      studentId: req.user.userId,
      status: "SUCCESS",
    })
      .populate("courseId", "title thumbnailUrl price")
      .sort({ paidAt: -1 });

    res.status(200).json({ message: "Payments fetched", payload: payments });
  } catch (err) {
    next(err);
  }
});
