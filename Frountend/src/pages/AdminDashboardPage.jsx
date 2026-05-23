import { useEffect, useState } from "react";
import { api } from "../services/api.js";

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserType, setSelectedUserType] = useState(null); // "STUDENT" or "INSTRUCTOR"
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");
  const [details, setDetails] = useState(null);

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

  const loadDetails = async (userId, userType) => {
    setDetailsLoading(true);
    setDetailsError("");
    try {
      const response = userType === "STUDENT"
        ? await api.getStudentDetails(userId)
        : await api.getInstructorDetails(userId);
      setDetails(response.data.payload);
    } catch (err) {
      setDetailsError(err.response?.data?.message || "Failed to load details");
    } finally {
      setDetailsLoading(false);
    }
  };

  const openUserDetails = (userId, userType) => {
    setSelectedUserType(userType);
    setSelectedUserId(userId);
    loadDetails(userId, userType);
  };

  const closeDetails = () => {
    setSelectedUserType(null);
    setSelectedUserId(null);
    setDetails(null);
  };

  if (loading) return <p>Loading dashboard...</p>;
  if (error && !users.length) return <p className="font-semibold text-red-700">{error}</p>;

  const students = users.filter((user) => user.role === "STUDENT");
  const instructors = users.filter((user) => user.role === "INSTRUCTOR");

  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.firstName || user.lastName || user.email;
  };

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-8 text-white md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Admin Control Center</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Platform health and user governance</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
            View users, manage access, and audit enrollment activity from one dashboard.
          </p>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Total Users</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalUsers || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Total Courses</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Total Enrollments</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalEnrollments || 0}</p>
        </article>
      </div>

      {/* STUDENTS SECTION */}
      <article className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Students</h2>
        <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <table className="w-full border-collapse">
            <thead className="bg-emerald-50/70">
              <tr className="text-left text-xs uppercase tracking-wide text-emerald-800">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {students.length ? (
                students.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
                    <td className="p-3">{getDisplayName(user)}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                        type="button"
                        onClick={() => openUserDetails(user._id, "STUDENT")}
                      >
                        View Details
                      </button>
                      <button
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        type="button"
                        onClick={() => toggleUserStatus(user._id, !user.isActive)}
                      >
                        {user.isActive ? "Block" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* INSTRUCTORS SECTION */}
      <article className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Instructors</h2>
        <div className="overflow-x-auto rounded-2xl border border-emerald-100 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <table className="w-full border-collapse">
            <thead className="bg-emerald-50/70">
              <tr className="text-left text-xs uppercase tracking-wide text-emerald-800">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {instructors.length ? (
                instructors.map((user) => (
                  <tr key={user._id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50">
                    <td className="p-3">{getDisplayName(user)}</td>
                    <td className="p-3">{user.email}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                        {user.isActive ? "Active" : "Blocked"}
                      </span>
                    </td>
                    <td className="p-3 flex gap-2">
                      <button
                        className="rounded-lg border border-purple-200 bg-white px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-50"
                        type="button"
                        onClick={() => openUserDetails(user._id, "INSTRUCTOR")}
                      >
                        View Details
                      </button>
                      <button
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        type="button"
                        onClick={() => toggleUserStatus(user._id, !user.isActive)}
                      >
                        {user.isActive ? "Block" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-slate-500">
                    No instructors found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* DETAILS MODAL */}
      {selectedUserType && details && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 px-4 backdrop-blur-[1px]">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  {selectedUserType === "STUDENT" ? "Student Details" : "Instructor Details"}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>

            {detailsLoading ? (
              <p className="text-center text-slate-500">Loading details...</p>
            ) : detailsError ? (
              <p className="font-semibold text-red-700">{detailsError}</p>
            ) : (
              <div className="space-y-6">
                {/* USER INFO */}
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <h4 className="text-lg font-bold text-slate-900 mb-3">User Information</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Name:</span>
                      <span className="text-slate-900">{getDisplayName(details.student || details.instructor)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Email:</span>
                      <span className="text-slate-900">{(details.student || details.instructor).email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-600">Status:</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        (details.student || details.instructor).isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {(details.student || details.instructor).isActive ? "Active" : "Blocked"}
                      </span>
                    </div>
                  </div>
                </section>

                {/* STUDENT SPECIFIC DETAILS */}
                {selectedUserType === "STUDENT" && (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Transactions</h4>
                    <div className="mb-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-600">Total Amount Paid:</span>
                        <span className="float-right text-lg font-bold text-blue-700">Rs.{details.totalAmountPaid}</span>
                      </div>
                    </div>
                    {details.payments.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {details.payments.map((payment) => (
                          <div key={payment._id} className="rounded-lg border border-slate-300 bg-white p-3 text-sm">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-slate-900">{payment.courseId?.title || "Unknown Course"}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                payment.status === "SUCCESS"
                                  ? "bg-green-100 text-green-700"
                                  : payment.status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}>
                                {payment.status}
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                              <span>Amount: Rs.{payment.amount}</span>
                              <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500">No transactions found.</p>
                    )}
                  </section>
                )}

                {/* INSTRUCTOR SPECIFIC DETAILS */}
                {selectedUserType === "INSTRUCTOR" && (
                  <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <h4 className="text-lg font-bold text-slate-900 mb-3">Earnings & Courses</h4>
                    <div className="mb-3 p-3 rounded-lg bg-purple-50 border border-purple-200">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-600">Total Earnings:</span>
                        <span className="float-right text-lg font-bold text-purple-700">Rs.{details.totalEarnings}</span>
                      </div>
                    </div>
                    {details.courses.length > 0 ? (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {details.courses.map((course) => (
                          <div key={course._id} className="rounded-lg border border-slate-300 bg-white p-3 text-sm">
                            <div className="flex justify-between mb-2">
                              <span className="font-semibold text-slate-900">{course.title}</span>
                              <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 rounded-full">
                                {course.enrollmentCount} enrolled
                              </span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-xs">
                              <span>Price: Rs.{course.price}</span>
                              <span>Earnings: Rs.{course.price * course.enrollmentCount}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-slate-500">No courses found.</p>
                    )}
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
