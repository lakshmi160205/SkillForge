import exp from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { UserTypeModel } from "../models/UserModel.js";
import { CourseModel } from "../models/CourseModel.js";
import { EnrollmentModel } from "../models/EnrollmentModel.js";
import { ReviewModel } from "../models/ReviewModel.js";

export const adminRoute = exp.Router();

adminRoute.use(verifyToken, authorizeRoles("ADMIN"));

adminRoute.get("/dashboard", async (req, res, next) => {
  try {
    const [users, courses, enrollments, reviews] = await Promise.all([
      UserTypeModel.find().select("-password"),
      CourseModel.find(),
      EnrollmentModel.find(),
      ReviewModel.find(),
    ]);

    res.status(200).json({
      message: "Admin dashboard fetched",
      payload: {
        totalUsers: users.length,
        totalStudents: users.filter((user) => user.role === "STUDENT").length,
        totalInstructors: users.filter((user) => user.role === "INSTRUCTOR").length,
        totalCourses: courses.length,
        totalEnrollments: enrollments.length,
        totalReviews: reviews.length,
      },
    });
  } catch (err) {
    next(err);
  }
});

adminRoute.get("/users", async (req, res, next) => {
  try {
    const users = await UserTypeModel.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json({ message: "Users fetched", payload: users });
  } catch (err) {
    next(err);
  }
});

adminRoute.patch("/users/:userId/status", async (req, res, next) => {
  try {
    const updatedUser = await UserTypeModel.findByIdAndUpdate(
      req.params.userId,
      { isActive: req.body.isActive },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User status updated", payload: updatedUser });
  } catch (err) {
    next(err);
  }
});

adminRoute.get("/courses", async (req, res, next) => {
  try {
    const courses = await CourseModel.find()
      .populate("instructorId", "firstName lastName email")
      .sort({ createdAt: -1 });

    res.status(200).json({ message: "Courses fetched", payload: courses });
  } catch (err) {
    next(err);
  }
});