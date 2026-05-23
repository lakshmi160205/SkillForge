import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const dashboardPathByRole = {
  STUDENT: "/student/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  ADMIN: "/admin/dashboard",
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const user = await login(form);
      const fallback = dashboardPathByRole[user.role] || "/";
      const redirectPath = location.state?.from?.pathname || fallback;
      navigate(redirectPath, { replace: true });
    } catch (err) {
      const message = err.response?.data?.message;

      if (message) {
        setError(message);
        return;
      }

      if (err.code === "ERR_NETWORK") {
        setError("Cannot reach server. Start backend on http://localhost:5000 and try again.");
        return;
      }

      setError("Unable to login. Please try again.");
    }
  };

  return (
    <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
      <div className="grid content-between gap-6 rounded-4xl bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 p-7 text-white shadow-[0_28px_70px_rgba(6,95,70,0.14)]">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">Welcome Back</p>
          <h2 className="text-4xl font-bold leading-tight md:text-5xl">Pick up exactly where you left off.</h2>
          <p className="max-w-xl text-sm leading-7 text-white/90 md:text-base">
            Sign in to continue learning, manage courses, or oversee the platform with a cleaner role-based dashboard experience.
          </p>
        </div>

        <div className="grid gap-3 text-sm text-white/90 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
            <p className="font-semibold">Students</p>
            <p className="mt-1 text-white/80">Track enrolled courses and progress.</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
            <p className="font-semibold">Instructors</p>
            <p className="mt-1 text-white/80">Manage courses and monitor learners.</p>
          </div>
          <div className="rounded-2xl bg-white/12 p-4 backdrop-blur-sm">
            <p className="font-semibold">Admins</p>
            <p className="mt-1 text-white/80">Oversee users, courses, and activity.</p>
          </div>
        </div>
      </div>

      <form className="grid w-full gap-4 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)] md:p-8" onSubmit={onSubmit}>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">Login</h2>
          <p className="text-sm text-slate-500">Use the same role you chose during registration.</p>
        </div>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Email
          <input className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 transition focus:ring" name="email" type="email" value={form.email} onChange={onChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Password
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 transition focus:ring"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Role
          <select className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 transition focus:ring" name="role" value={form.role} onChange={onChange}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
            <option value="ADMIN">Admin</option>
          </select>
        </label>

        {error && <p className="font-semibold text-red-700">{error}</p>}

        <button type="submit" className="sf-btn-primary rounded-full px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </button>

        <p className="text-sm text-slate-500">
          New user? <Link className="font-semibold text-emerald-700" to="/register">Create account</Link>
        </p>
      </form>
    </section>
  );
}
