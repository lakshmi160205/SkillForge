import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { useNavigate } from "react-router-dom";

export function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.getAdminCourses();
      setCourses(res.data.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (courseId, nextBlocked) => {
    try {
      await api.updateCourseStatus(courseId, nextBlocked);
      setCourses((prevCourses) =>
        prevCourses.map((course) =>
          course._id === courseId ? { ...course, isBlocked: nextBlocked } : course,
        ),
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update course");
    }
  };

  if (loading) return <p>Loading courses...</p>;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Manage Courses</h1>
        <div>
          <button className="sf-btn-secondary mr-2" onClick={() => navigate('/admin/dashboard')}>Back to Dashboard</button>
          <button className="sf-btn-primary" onClick={load}>Refresh</button>
        </div>
      </div>

      {error && <p className="font-semibold text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
        <table className="w-full border-collapse">
          <thead className="bg-emerald-50/70">
            <tr className="text-left text-xs uppercase tracking-wide text-emerald-800">
              <th className="p-3">Title</th>
              <th className="p-3">Instructor</th>
              <th className="p-3">Published</th>
              <th className="p-3">Blocked</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {courses.length ? (
              courses.map((c) => (
                <tr key={c._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
                  <td className="p-3">{c.title}</td>
                  <td className="p-3">{c.instructorId ? `${c.instructorId.firstName} ${c.instructorId.lastName || ''}` : 'Unknown'}</td>
                  <td className="p-3">{c.isPublished ? 'Yes' : 'No'}</td>
                  <td className="p-3">{c.isBlocked ? 'Yes' : 'No'}</td>
                  <td className="p-3 flex gap-2">
                    <button className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700" onClick={() => toggleBlock(c._id, !c.isBlocked)}>
                      {c.isBlocked ? 'Unblock' : 'Block'}
                    </button>
                    <a className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700" href={`/courses/${c._id}`}>
                      View
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-slate-500">No courses found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default AdminCoursesPage;
