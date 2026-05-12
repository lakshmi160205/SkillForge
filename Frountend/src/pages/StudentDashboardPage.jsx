import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export function StudentDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryingCourseId, setRetryingCourseId] = useState("");
  const [retryMessage, setRetryMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.getStudentDashboard();
      setData(response.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRetryVerification = async (courseId) => {
    setRetryingCourseId(courseId);
    setRetryMessage("");
    setError("");

    try {
      const { data: retryResponse } = await api.retryVerifyPayment(courseId);
      setRetryMessage(retryResponse?.message || "Payment verification retried successfully.");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Could not verify payment yet. Please try again.");
    } finally {
      setRetryingCourseId("");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="font-semibold text-red-700">{error}</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Student Dashboard</h1>
      {retryMessage ? <p className="font-semibold text-green-700">{retryMessage}</p> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Enrolled</h3>
          <p className="text-3xl font-bold text-emerald-800">{data?.totalEnrolledCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Completed</h3>
          <p className="text-3xl font-bold text-emerald-800">{data?.completedCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Reviews</h3>
          <p className="text-3xl font-bold text-emerald-800">{data?.reviews?.length || 0}</p>
        </article>
        <Link
          to="/student/transactions"
          className="group flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5 transition hover:border-emerald-300 hover:bg-emerald-50"
        >
          <div>
            <h3 className="text-sm font-semibold text-slate-500">Transactions</h3>
            <p className="text-lg font-bold text-emerald-700 group-hover:text-emerald-800">View History</p>
          </div>
          <span className="text-2xl group-hover:translate-x-0.5 transition">→</span>
        </Link>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {(data?.enrollments || []).map((item) => {
          const course = item.courseId;
          const progress = Math.max(0, Math.min(100, item.progressPercentage || 0));
          const isCompleted = progress === 100;

          return (
            <Link
              key={item._id}
              to={`/student/courses/${course?._id}/lectures`}
              className="group grid min-w-0 gap-4 overflow-hidden rounded-3xl border border-emerald-100 bg-white p-4 shadow-[0_16px_36px_rgba(6,95,70,0.08)] transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_22px_45px_rgba(6,95,70,0.12)]"
            >
              {course?.thumbnailUrl ? (
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={course.thumbnailUrl}
                    alt={`${course.title} thumbnail`}
                    className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 backdrop-blur-sm">
                    {course?.level || "Course"}
                  </span>
                </div>
              ) : (
                <div className="grid h-40 place-items-center rounded-2xl bg-linear-to-br from-emerald-50 via-slate-50 to-amber-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                  No Thumbnail
                </div>
              )}

              <div className="space-y-2">
                <h3 className="line-clamp-2 text-lg font-bold text-slate-900">{course?.title || "Untitled course"}</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">
                    {item.paymentStatus}
                  </span>
                  <span className={`rounded-full px-2.5 py-1 font-semibold ${isCompleted ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {isCompleted ? "Completed" : "In progress"}
                  </span>
                  {item.paymentStatus === "PENDING" ? (
                    <button
                      type="button"
                      className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 font-semibold text-amber-700 transition hover:bg-amber-100 disabled:cursor-not-allowed"
                      onClick={(event) => {
                        event.preventDefault();
                        onRetryVerification(course?._id);
                      }}
                      disabled={retryingCourseId === course?._id}
                    >
                      {retryingCourseId === course?._id ? "Verifying..." : "Retry payment verification"}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
                  <span>Progress</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-700" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-emerald-700">Open lectures</span>
                <span className="text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700">&rarr;</span>
              </div>
            </Link>
          );
        })}
      </div>

      {!(data?.enrollments || []).length && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center">
          <p className="text-base font-semibold text-slate-700">No enrolled courses yet</p>
          <p className="mt-1 text-sm text-slate-500">Enroll in a course to start learning and track progress here.</p>
        </div>
      )}
    </section>
  );
}
