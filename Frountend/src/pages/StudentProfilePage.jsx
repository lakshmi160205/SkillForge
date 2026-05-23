import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError("");

      try {
        const profileResponse = await api.getStudentProfile();
        setProfile(profileResponse.data?.payload || null);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const joinedOn = useMemo(() => {
    if (!profile?.createdAt) {
      return "-";
    }

    return new Date(profile.createdAt).toLocaleDateString();
  }, [profile]);

  const fullName = useMemo(() => {
    const first = profile?.firstName || "";
    const last = profile?.lastName || "";
    const name = `${first} ${last}`.trim();
    return name || "Student";
  }, [profile]);

  const initials = useMemo(() => {
    const first = profile?.firstName?.[0] || "S";
    const last = profile?.lastName?.[0] || "";
    return `${first}${last}`.toUpperCase();
  }, [profile]);

  if (loading) {
    return (
      <section className="space-y-5">
        <div className="h-44 animate-pulse rounded-4xl bg-emerald-100/70" />
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="h-80 animate-pulse rounded-3xl bg-slate-200/70" />
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="h-32 animate-pulse rounded-2xl bg-slate-200/70" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4">
        <p className="font-semibold text-red-700">{error}</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] sf-animate-enter">
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-8 text-white md:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Student Profile</p>
              <h1 className="mt-2 text-3xl font-bold md:text-4xl">{fullName}</h1>
              <p className="mt-2 text-sm text-white/85 md:text-base">Manage your account overview and quickly jump back into your learning.</p>
            </div>
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/25 bg-white/10 px-4 py-3 backdrop-blur-sm">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-white text-lg font-bold text-emerald-800">
                {initials}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{profile?.email || "-"}</p>
                <p className="text-xs uppercase tracking-wide text-white/80">{profile?.role || "STUDENT"}</p>
              </div>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sf-animate-enter-delay-1 sf-hover-lift">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Account Details</h2>
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Verified Learner</span>
          </div>

          <div className="mt-4 grid gap-3 text-sm">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 text-base font-semibold text-slate-900">{fullName}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-base font-semibold text-slate-900 break-all">{profile?.email || "-"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</p>
                <p className="mt-1 text-base font-semibold text-emerald-800">{profile?.role || "STUDENT"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Joined</p>
                <p className="mt-1 text-base font-semibold text-slate-900">{joinedOn}</p>
              </div>
            </div>
          </div>
        </article>

        <article className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sf-animate-enter-delay-2 sf-hover-lift">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Learning Hub</span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-emerald-50/60 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Learning Area</p>
              <p className="mt-1 text-base font-semibold text-slate-900">Course Dashboard</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-amber-50/50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Billing Area</p>
              <p className="mt-1 text-base font-semibold text-slate-900">Transaction History</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Link to="/student/dashboard" className="sf-btn-primary rounded-full px-4 py-2 text-sm font-semibold transition">
              Continue Learning
            </Link>
            <Link to="/student/transactions" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              View Transactions
            </Link>
            <Link to="/" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Browse Courses
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
