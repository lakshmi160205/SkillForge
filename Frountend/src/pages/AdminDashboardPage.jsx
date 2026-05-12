import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardResponse, usersResponse] = await Promise.all([
        api.getAdminDashboard(),
        api.getUsers(),
      ]);
      setDashboard(dashboardResponse.data.payload);
      setUsers(usersResponse.data.payload || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleUserStatus = async (userId, nextStatus) => {
    try {
      await api.updateUserStatus(userId, nextStatus);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user");
    }
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error) return <p className="font-semibold text-red-700">{error}</p>;

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Total Users</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalUsers || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Total Courses</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5">
          <h3 className="text-sm font-semibold text-slate-500">Total Enrollments</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalEnrollments || 0}</p>
        </article>
      </div>

      <h2 className="text-2xl font-bold text-slate-900">Users</h2>
      <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/5">
        <table className="w-full border-collapse">
          <thead className="bg-emerald-50">
            <tr className="text-left text-xs uppercase tracking-wide text-emerald-800">
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Status</th>
              <th className="p-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
                <td className="p-3">{user.firstName} {user.lastName}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.role}</td>
                <td className="p-3">{user.isActive ? "Active" : "Blocked"}</td>
                <td className="p-3">
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                    type="button"
                    onClick={() => toggleUserStatus(user._id, !user.isActive)}
                  >
                    {user.isActive ? "Block" : "Activate"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
