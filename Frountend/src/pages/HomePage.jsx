import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../services/api.js";
import { mediaUrl } from "../services/media.js";

const dashboardPathByRole = {
  STUDENT: "/student/dashboard",
  INSTRUCTOR: "/instructor/dashboard",
  ADMIN: "/admin/dashboard",
};

export function HomePage() {
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const featuredStats = [
    { label: "Students can browse, enroll, and track learning progress", value: "Student Portal" },
    { label: "Instructors can create courses and manage lectures", value: "Instructor Tools" },
    { label: "Admins can monitor users, courses, and platform activity", value: "Admin Control" },
  ];

  const topCategories = ["Programming", "Data Science", "Design", "Business", "Marketing", "Personal Development"];

  const platformHighlights = [
    {
      title: "Learn from practical courses",
      description: "Discover job-relevant lessons that move from basics to applied projects.",
    },
    {
      title: "Study at your pace",
      description: "Watch lectures anytime and continue progress from your personal dashboard.",
    },
    {
      title: "Track outcomes clearly",
      description: "Measure progress, completion, ratings, and engagement in one place.",
    },
  ];

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");
      try {
        const { data } = await api.getCourses(search ? { search } : undefined);
        setCourses(data.payload || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadCourses, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const title = useMemo(() => {
    if (search) {
      return `Results for \"${search}\"`;
    }
    return "Featured Courses";
  }, [search]);

  const groupedCourses = useMemo(() => {
    const map = {};
    for (const c of courses || []) {
      const key = c.category || "Uncategorized";
      if (!map[key]) map[key] = [];
      if (map[key].length < 2) map[key].push(c);
    }
    return map;
  }, [courses]);

  return (
    <section className="space-y-6">
      <div className="grid gap-5 overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_30px_75px_rgba(6,95,70,0.08)] md:grid-cols-[1.2fr_0.8fr] sf-animate-enter">
        <div className="grid gap-5 bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-8 text-white md:px-8">
          <p className="w-fit rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-white/85">
            Online Learning Marketplace
          </p>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Gain in-demand skills with expert-led online courses.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-white/85">
            Explore published courses, compare by level and category, and jump into a personalized learning journey.
          </p>

          <div className="max-w-2xl rounded-full border border-white/25 bg-white p-1.5">
            <div className="flex items-center gap-2">
              <input
                className="h-11 w-full rounded-full bg-transparent px-5 text-sm text-slate-800 outline-none ring-emerald-300 transition focus:ring"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for anything"
              />
              <span className="inline-flex h-10 shrink-0 items-center rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white">
                Search
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const redirectPath = isAuthenticated
                  ? dashboardPathByRole[role] || "/login"
                  : "/login";
                navigate(redirectPath);
              }}
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
            >
              Start learning
            </button>
            <Link to="/categories" className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15">
              Browse categories
            </Link>
          </div>
        </div>

        <div className="grid gap-3 bg-emerald-50/70 p-6 md:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-800">Platform Overview</p>
          <p className="max-w-sm text-sm leading-6 text-slate-600">
            SkillForge is an online learning platform where students discover courses, instructors publish teaching content, and admins manage the system from one connected interface.
          </p>
          <div className="grid gap-3">
            {featuredStats.map((item) => (
              <div key={item.label} className="rounded-2xl border border-emerald-100 bg-white p-4">
                <p className="text-xl font-bold text-slate-900">{item.value}</p>
                <p className="mt-1 text-sm text-slate-600">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sf-animate-enter-delay-1">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Top Categories</h2>
          <Link to="/categories" className="text-sm font-semibold text-emerald-800 hover:text-emerald-900">
            View all categories
          </Link>
        </div>
        <div className="flex flex-wrap gap-2">
          {topCategories.map((category) => (
            <Link
              key={category}
              to={`/categories?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-800"
            >
              {category}
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        <div className="flex flex-wrap gap-2 text-sm text-slate-500">
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Curated experience</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Fast search</span>
          <span className="rounded-full bg-white px-3 py-1 shadow-sm">Role based</span>
        </div>
      </div>

      {loading && <p className="text-slate-500">Loading courses...</p>}
      {error && <p className="font-semibold text-red-700">{error}</p>}

      {!loading && !courses.length && (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-500">
          No courses found yet. Try a different keyword or publish a course from the instructor dashboard.
        </div>
      )}

      {Object.keys(groupedCourses).length ? (
        <div className="grid gap-6">
          {Object.entries(groupedCourses).map(([category, items]) => (
            <section key={category} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">{category}</h3>
                <Link
                  to={`/categories?category=${encodeURIComponent(category)}`}
                  className="text-sm font-medium text-emerald-700"
                >
                  View all
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {items.map((course) => (
                  <article key={course._id} className="group grid gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] sf-hover-lift sf-animate-enter-delay-2">
                    {course.thumbnailUrl ? (
                      <img
                        src={mediaUrl(course.thumbnailUrl)}
                        alt={`${course.title} thumbnail`}
                        className="h-40 w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-40 w-full place-items-center bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        No Thumbnail
                      </div>
                    )}
                    <div className="grid gap-2 p-4">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">{course.category}</span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">{course.level}</span>
                      </div>
                      <h3 className="line-clamp-2 text-base font-bold text-slate-900">{course.title}</h3>
                      <p className="line-clamp-2 text-xs leading-5 text-slate-600">{course.subtitle || course.description}</p>
                      <p className="text-xs text-slate-500">By {course.instructorId?.firstName || "Instructor"}</p>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-amber-700">{course.averageRating || 0} / 5</span>
                        <span className="text-xs text-slate-500">{course.totalEnrollments || 0} enrolled</span>
                      </div>
                      <p className="text-lg font-bold text-slate-900">
                        {course.price > 0 ? `Rs.${course.price}` : "Free"}
                      </p>
                      <Link className="sf-btn-primary rounded-xl px-4 py-2 text-center text-sm font-semibold transition" to={`/courses/${course._id}`}>
                        View Course
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {/* fallback: show nothing when no grouped courses */}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3 sf-animate-enter-delay-2">
        {platformHighlights.map((highlight) => (
          <article key={highlight.title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h3 className="text-lg font-bold text-slate-900">{highlight.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">{highlight.description}</p>
          </article>
        ))}
      </section>

      <section className="rounded-4xl border border-emerald-100 bg-linear-to-r from-white to-emerald-50 p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)] sf-animate-enter-delay-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">For Instructors</p>
            <h3 className="mt-1 text-2xl font-bold text-slate-900">Share your knowledge with learners worldwide</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Create engaging lessons, publish your course, and grow your impact through SkillForge.</p>
          </div>
          <Link to="/teach" className="sf-btn-primary w-fit rounded-full px-5 py-3 text-sm font-semibold transition">
            Start teaching
          </Link>
        </div>
      </section>
    </section>
  );
}
