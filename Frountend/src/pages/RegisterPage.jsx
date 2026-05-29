import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState("");

  const onChange = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setFieldErrors({});
    setSuccess("");

    try {
      await register(form);
      setSuccess("Registration successful. Please login.");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      const resp = err.response?.data;
      if (resp) {
        if (resp.details && Array.isArray(resp.details)) {
          const map = {};
          resp.details.forEach((d) => {
            if (d && d.field) map[d.field] = d.message || String(d);
          });
          setFieldErrors(map);
        }

        setError(resp.message || "Unable to register");
        return;
      }

      setError("Unable to register");
    }
  };

  return (
    <section className="grid place-items-center py-3">
      <form className="grid w-full max-w-xl gap-3 rounded-4xl border border-slate-200 bg-white p-6 shadow-[0_20px_48px_rgba(15,23,42,0.08)]" onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold text-slate-900">Create account</h2>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          First name
          <input className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring" name="firstName" value={form.firstName} onChange={onChange} required />
          {fieldErrors.firstName && <p className="text-sm font-semibold text-red-700">{fieldErrors.firstName}</p>}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Last name
          <input className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring" name="lastName" value={form.lastName} onChange={onChange} />
          {fieldErrors.lastName && <p className="text-sm font-semibold text-red-700">{fieldErrors.lastName}</p>}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Email
          <input className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring" name="email" type="email" value={form.email} onChange={onChange} required />
          {fieldErrors.email && <p className="text-sm font-semibold text-red-700">{fieldErrors.email}</p>}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Password
          <input
            className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring"
            name="password"
            type="password"
            value={form.password}
            onChange={onChange}
            required
          />
          {fieldErrors.password && <p className="text-sm font-semibold text-red-700">{fieldErrors.password}</p>}
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Role
          <select className="w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm outline-none ring-emerald-200 focus:ring" name="role" value={form.role} onChange={onChange}>
            <option value="STUDENT">Student</option>
            <option value="INSTRUCTOR">Instructor</option>
          </select>
        </label>

        {error && <p className="font-semibold text-red-700">{error}</p>}
        {success && <p className="font-semibold text-green-700">{success}</p>}

        <button type="submit" className="sf-btn-primary rounded-full px-4 py-3 text-sm font-semibold transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create account"}
        </button>

        <p className="text-sm text-slate-500">
          Already have account? <Link className="font-semibold text-emerald-700" to="/login">Login</Link>
        </p>
      </form>
    </section>
  );
}
