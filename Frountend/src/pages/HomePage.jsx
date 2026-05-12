import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

export function HomePage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const featuredStats = [
    { label: "Students can browse, enroll, and track learning progress", value: "Student Portal" },
    { label: "Instructors can create courses and manage lectures", value: "Instructor Tools" },
    { label: "Admins can monitor users, courses, and platform activity", value: "Admin Control" },
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

  return (
    <section className="space-y-6">
      <div className="grid gap-5 rounded-4xl border border-emerald-100 bg-white px-6 py-7 shadow-[0_28px_70px_rgba(6,95,70,0.08)] md:grid-cols-[1.3fr_0.7fr] md:px-8">
          <div className="grid gap-5">
            <p className="rounded-2xl w-67 bg-emerald-700 text-xs px-4 py-2 font-bold tracking-[0.22em] text-white uppercase">Online Learning Platform</p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
              Learn with a cleaner path from discovery to completion.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
              Browse courses, enroll faster, and move between student, instructor, and admin workflows without getting lost in the interface.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                className="rounded-full bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
                to="/register"
              >
                Start learning
              </Link>
              
            </div>

            <div className="relative max-w-2xl">
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 pr-32 text-sm outline-none ring-emerald-200 transition focus:ring"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by title, subtitle, or tag"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full  px-3 py-1 text-xs font-semibold text-emerald-800">
                Search
              </span>
            </div>
          </div>

          <div className="grid gap-3 rounded-3xl bg-linear-to-br from-emerald-700 via-emerald-600 to-amber-400 p-5 text-white shadow-xl shadow-emerald-900/15">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/80">About The Website</p>
            <p className="max-w-sm text-sm leading-6 text-white/90">
              SkillForge is an online learning platform where students discover courses, instructors publish teaching content, and admins manage the system from one connected interface.
            </p>
            <div className="grid gap-3">
              {featuredStats.map((item) => (
                <div key={item.label} className="rounded-2xl bg-white/14 p-4 backdrop-blur-sm">
                  <p className="text-2xl font-bold">{item.value}</p>
                  <p className="mt-1 text-sm text-white/85">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
      </div>

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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => (
          <article key={course._id} className="group grid gap-2 rounded-3xl border border-emerald-100 bg-white p-3 shadow-[0_18px_40px_rgba(6,95,70,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(6,95,70,0.12)]">
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={`${course.title} thumbnail`}
                className="h-36 w-full rounded-2xl object-cover"
              />
            ) : (
              <div className="grid h-36 w-full place-items-center rounded-2xl bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                No Thumbnail
              </div>
            )}
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{course.category}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{course.level}</span>
            </div>
            <h3 className="text-base font-bold text-slate-900">{course.title}</h3>
            <p className="line-clamp-2 text-xs leading-5 text-slate-600">{course.subtitle || course.description}</p>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500">By {course.instructorId?.firstName || "Instructor"}</p>
              <div className="flex gap-1.5">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{course.totalEnrollments || 0} enrolled</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{course.averageRating || 0} / 5</span>
              </div>
            </div>
            <Link className="rounded-xl bg-emerald-700 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-emerald-800" to={`/courses/${course._id}`}>
              View Course
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
