import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { CheckoutForm } from "../components/CheckoutForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../services/api.js";
import { mediaUrl } from "../services/media.js";

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

export function CourseDetailsPage() {
  const { courseId } = useParams();
  const { cart, addToCart } = useCart();
  const navigate = useNavigate();
  const { role, isAuthenticated } = useAuth();
  const canUseCart = isAuthenticated && role === "STUDENT";
  const needsLogin = !isAuthenticated;

  const [courseData, setCourseData] = useState(null);
  const [message, setMessage] = useState("");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState({
    isLoading: false,
    isEnrolled: false,
    progressPercentage: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");
      try {
        const { data } = await api.getCourseById(courseId);
        setCourseData(data.payload);
      } catch (err) {
        if (err.code === "ERR_NETWORK") {
          setLoadError("Cannot reach the deployed backend server. Check the backend URL and try again.");
        } else {
          setLoadError(err.response?.data?.message || "Failed to fetch course");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [courseId]);

  useEffect(() => {
    const loadEnrollmentStatus = async () => {
      if (role !== "STUDENT") {
        setEnrollmentStatus({
          isLoading: false,
          isEnrolled: false,
          progressPercentage: 0,
        });
        return;
      }

      setEnrollmentStatus((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await api.getStudentCourseProgress(courseId);
        const payload = response.data?.payload || {};

        setEnrollmentStatus({
          isLoading: false,
          isEnrolled: true,
          progressPercentage: payload.progressPercentage || 0,
        });
      } catch (err) {
        if (err.response?.status === 404) {
          setEnrollmentStatus({
            isLoading: false,
            isEnrolled: false,
            progressPercentage: 0,
          });
          return;
        }

        setEnrollmentStatus((prev) => ({ ...prev, isLoading: false }));
      }
    };

    if (courseId) {
      loadEnrollmentStatus();
    }
  }, [courseId, role]);

  const onEnroll = async () => {
    setActionError("");
    setMessage("");
    try {
      const { data } = await api.enrollCourse(courseId);
      setMessage(data.message || "Enrolled");
      setEnrollmentStatus({
        isLoading: false,
        isEnrolled: true,
        progressPercentage: 0,
      });
    } catch (err) {
      setActionError(err.response?.data?.message || "Enrollment failed");
    }
  };

  const openCheckout = () => {
    setActionError("");
    setMessage("");

    if (!stripePromise) {
      setActionError("Stripe is not configured on frontend. Add VITE_STRIPE_PUBLISHABLE_KEY.");
      return;
    }

    setIsCheckoutOpen(true);
  };

  const closeCheckout = () => {
    setIsCheckoutOpen(false);
  };

  const handlePaymentSuccess = (successMessage) => {
    setMessage(successMessage || "Payment successful. Enrollment completed.");
    setIsCheckoutOpen(false);
    setEnrollmentStatus({
      isLoading: false,
      isEnrolled: true,
      progressPercentage: 0,
    });
  };

  const onAddCourseToCart = async () => {
    if (!course) return;
    if (needsLogin) {
      setActionError("Please log in as a student before adding this course to cart.");
      return;
    }
    if (!canUseCart) {
      setActionError("Only students can add courses to the cart.");
      return;
    }
    if (isInCart) {
      setMessage("Course is already in your cart.");
      return;
    }

    setActionError("");
    setMessage("");
    setIsAddingToCart(true);

    try {
      await addToCart(course._id);
      setMessage("Course added to cart.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to add course to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const goToCourseLectures = () => {
    navigate(`/student/courses/${courseId}/lectures`);
  };

  if (loading) {
    return <p>Loading course...</p>;
  }

  if (loadError) {
    return <p className="font-semibold text-red-700">{loadError}</p>;
  }

  if (!courseData?.course) {
    return <p>Course not found.</p>;
  }

  const { course, reviews } = courseData;
  const isInCart = Boolean(cart?.some((item) => item.course?._id === course?._id));
  const lectureCount = course.lectures?.length || 0;
  const previewCount = course.lectures?.filter((lecture) => lecture.isPreview).length || 0;
  const reviewCount = reviews?.length || 0;
  const instructorName = course.instructorId?.firstName
    ? `${course.instructorId.firstName} ${course.instructorId.lastName || ""}`.trim()
    : "Instructor";

  return (
    <section className="space-y-8">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_28px_70px_rgba(6,95,70,0.08)]">
        <div className="bg-linear-to-r from-emerald-800 via-emerald-700 to-amber-500 px-6 py-8 text-white md:px-8 md:py-10">
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-white/80">
                <span>{course.category}</span>
                <span className="h-1 w-1 rounded-full bg-white/70" />
                <span>{course.level}</span>
                <span className="h-1 w-1 rounded-full bg-white/70" />
                <span>{course.language}</span>
              </div>

              <div className="space-y-3">
                <h1 className="max-w-4xl text-4xl font-bold leading-tight md:text-6xl">{course.title}</h1>
                <p className="max-w-3xl text-base leading-7 text-white/90 md:text-lg">
                  {course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
                <span className="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur-sm">By {instructorName}</span>
                <span className="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur-sm">{lectureCount} lectures</span>
                <span className="rounded-full bg-white/12 px-3 py-1.5 backdrop-blur-sm">{course.averageRating || 0}/5 rating</span>
              </div>
              {message && <p className="font-semibold text-emerald-100">{message}</p>}
              {actionError && <p className="font-semibold text-amber-100">{actionError}</p>}
            </div>

            <div>
              {needsLogin ? (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                >
                  Login to add to cart
                </button>
              ) : canUseCart ? (
                <>
                  <button
                    type="button"
                    onClick={onAddCourseToCart}
                    disabled={isAddingToCart || isInCart}
                    className="w-full rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                  >
                    {isInCart ? "Already in cart" : isAddingToCart ? "Adding to cart..." : "Add to cart"}
                  </button>
                  {message && <p className="mt-3 text-sm font-semibold text-emerald-700">{message}</p>}
                  {actionError && <p className="mt-3 text-sm font-semibold text-amber-800">{actionError}</p>}
                </>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Add to cart is available for students only.
                </div>
              )}
            </div>

            <div className="rounded-[1.75rem] bg-white/12 p-5 backdrop-blur-md">
              <div className="space-y-5 rounded-3xl bg-white px-5 py-5 text-slate-900 shadow-lg shadow-emerald-950/10">
                {course.thumbnailUrl ? (
                  <img
                    src={mediaUrl(course.thumbnailUrl)}
                    alt={`${course.title} thumbnail`}
                    className="h-48 w-full rounded-2xl object-cover"
                  />
                ) : (
                  <div className="grid h-48 w-full place-items-center rounded-2xl bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    No Thumbnail
                  </div>
                )}

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Course Access</p>
                  <p className="mt-2 text-4xl font-bold text-emerald-800">
                    {course.price > 0 ? `Rs.${course.price}` : "Free"}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Includes lectures, reviews, and progress tracking.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Lectures</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{lectureCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Preview Lessons</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{previewCount}</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Reviews</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-800">{reviewCount}</p>
                  </div>
                </div>

                {role === "STUDENT" ? (
                  enrollmentStatus.isLoading ? (
                    <button
                      className="w-full cursor-wait rounded-2xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
                      type="button"
                      disabled
                    >
                      Checking access...
                    </button>
                  ) : enrollmentStatus.isEnrolled ? (
                    <button
                      className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      type="button"
                      onClick={goToCourseLectures}
                    >
                      {enrollmentStatus.progressPercentage > 0 ? "Continue Course" : "Start Course"}
                    </button>
                  ) : course.price > 0 ? (
                    <button
                      className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      type="button"
                      onClick={openCheckout}
                    >
                      Pay & Enroll
                    </button>
                  ) : (
                    <button
                      className="w-full rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                      type="button"
                      onClick={onEnroll}
                    >
                      Enroll Free
                    </button>
                  )
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Sign in as a student to enroll and track course progress.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>

      <section className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Course Content</h2>
              <p className="text-sm text-slate-500">A clear breakdown of everything included in this course.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-slate-600 shadow-sm">
              {lectureCount} lessons
            </span>
          </div>

          <div className="space-y-3">
            {(course.lectures || []).map((lecture, index) => (
              <article
                key={lecture._id}
                className="grid gap-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)] sm:grid-cols-[auto_1fr_auto] sm:items-start"
              >
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-sm font-bold text-emerald-700">
                  {index + 1}
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900">{lecture.title}</h3>
                    {lecture.isPreview && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                        Preview
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{lecture.description || "Lecture details will appear here."}</p>
                </div>

                <div className="text-sm font-semibold text-slate-500 sm:text-right">
                  {lecture.durationInSeconds}s
                </div>
              </article>
            ))}

            {!lectureCount && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-slate-500">
                No lectures have been added yet.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>
            <p className="text-sm text-slate-500">What learners think about this course.</p>
          </div>

          <div className="space-y-3">
            {reviews?.length ? (
              reviews.map((review) => (
                <article
                  key={review._id}
                  className="grid gap-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">{review.studentId?.firstName || "Student"}</h3>
                      <p className="text-xs uppercase tracking-wide text-slate-400">Verified learner review</p>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                      {review.rating}/5
                    </span>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">{review.comment || "No comment"}</p>
                </article>
              ))
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-5 py-8 text-center text-slate-500">
                No reviews yet. Be the first student to share feedback.
              </div>
            )}
          </div>
        </div>
      </section>

      {isCheckoutOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Complete Payment</h3>
                <p className="text-sm text-slate-500">Secure payment for instant course access.</p>
              </div>
              <button
                type="button"
                onClick={closeCheckout}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            <Elements stripe={stripePromise}>
              <CheckoutForm
                courseId={courseId}
                amount={course.price}
                courseName={course.title}
                onSuccess={handlePaymentSuccess}
                onCancel={closeCheckout}
              />
            </Elements>
          </div>
        </div>
      ) : null}
    </section>
  );
}
