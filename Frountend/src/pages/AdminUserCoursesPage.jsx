import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api.js";

export function AdminUserCoursesPage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getUserCourses(userId);
      setData(response.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [userId]);

  const courses = data?.courses || [];

  const displayName = useMemo(() => {
    if (!data?.user) return "User";
    const { firstName, lastName, email } = data.user;
    if (firstName && lastName) return `${firstName} ${lastName}`;
    return firstName || lastName || email || "User";
  }, [data]);

  const canManage = data?.role === "INSTRUCTOR";
  const courseCount = courses.length;
  const blockedCount = courses.filter((course) => course.isBlocked).length;
  const publishedCount = courses.filter((course) => course.isPublished).length;

  const toggleCourse = async (courseId, nextBlocked) => {
    try {
      await api.updateCourseStatus(courseId, nextBlocked);
      setData((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          courses: prev.courses.map((course) =>
            course._id === courseId ? { ...course, isBlocked: nextBlocked } : course,
          ),
        };
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course status");
    }
  };

  if (loading) return <p>Loading user courses...</p>;

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="bg-linear-to-r from-emerald-950 via-emerald-900 to-emerald-700 px-6 py-8 text-white md:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">User Course Overview</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{displayName}'s Courses</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
                Showing only courses associated with this user.
              </p>
            </div>

            <div className="flex gap-2">
              <button className="sf-btn-secondary" type="button" onClick={() => navigate(-1)}>Back</button>
              <Link className="rounded-full border border-white/20 bg-white px-4 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50" to="/admin/dashboard">
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid gap-4 border-t border-emerald-100 bg-emerald-50/40 p-4 md:grid-cols-3 md:p-6">
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Courses</p>
            <p className="mt-2 text-3xl font-bold text-emerald-800">{courseCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Published</p>
            <p className="mt-2 text-3xl font-bold text-emerald-800">{publishedCount}</p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.05)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Blocked</p>
            <p className="mt-2 text-3xl font-bold text-emerald-800">{blockedCount}</p>
          </div>
        </div>
      </article>

      {error && <p className="font-semibold text-red-700">{error}</p>}

      <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <div className="border-b border-emerald-100 bg-emerald-50/60 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-900">Course List</p>
        </div>

        {courses.length ? (
          <div className="overflow-x-auto">
            <table className="min-w-[920px] w-full border-collapse">
              <thead className="bg-emerald-50/70">
                <tr className="text-left text-xs uppercase tracking-wide text-emerald-800">
                  <th className="p-4 sf-table-nowrap">Title</th>
                  <th className="p-4 sf-table-nowrap">Category</th>
                  <th className="p-4 sf-table-nowrap">Level</th>
                  <th className="p-4 sf-table-nowrap">Published</th>
                  <th className="p-4 sf-table-nowrap">Blocked</th>
                  <th className="p-4 sf-table-nowrap">Action</th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course) => (
                  <tr key={course._id} className="border-t border-slate-100 text-sm text-slate-700 transition hover:bg-slate-50">
                    <td className="p-4 align-top">
                      <div className="max-w-[320px] font-semibold leading-snug text-slate-900 break-words">{course.title}</div>
                      <div className="mt-1 text-xs text-slate-500">{course.subtitle}</div>
                    </td>
                    <td className="p-4 align-top sf-table-nowrap">{course.category}</td>
                    <td className="p-4 align-top sf-table-nowrap">
                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                        {course.level}
                      </span>
                    </td>
                    <td className="p-4 align-top sf-table-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${course.isPublished ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                        {course.isPublished ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-4 align-top sf-table-nowrap">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${course.isBlocked ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {course.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="p-4 align-top sf-table-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                          to={`/courses/${course._id}`}
                        >
                          View
                        </Link>
                        {canManage && (
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            onClick={() => toggleCourse(course._id, !course.isBlocked)}
                          >
                            {course.isBlocked ? "Unblock" : "Block"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid place-items-center px-6 py-16 text-center">
            <div className="max-w-md space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-50 text-2xl">📚</div>
              <h2 className="text-xl font-bold text-slate-900">No courses found for this user</h2>
              <p className="text-sm text-slate-500">
                This user does not have any courses yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminUserCoursesPage;
