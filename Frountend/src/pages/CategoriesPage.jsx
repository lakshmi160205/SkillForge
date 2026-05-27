import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../services/api.js";
import { mediaUrl } from "../services/media.js";

const categoryOptions = [
  "Programming",
  "Data Science",
  "Design",
  "Business",
  "Marketing",
  "Personal Development",
];

export function CategoriesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "Programming";
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError("");

      try {
        const { data } = await api.getCourses({ category: selectedCategory });
        setCourses(data.payload || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load category courses");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [selectedCategory]);

  const subtitle = useMemo(() => {
    return `Browse top ${selectedCategory} courses from SkillForge instructors.`;
  }, [selectedCategory]);

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-8 text-white md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Browse Categories</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">{selectedCategory}</h1>
          <p className="mt-2 text-sm text-white/85 md:text-base">{subtitle}</p>
        </div>
      </article>

      <div className="flex flex-wrap gap-2">
        {categoryOptions.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setSearchParams({ category })}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              category === selectedCategory
                ? "bg-emerald-700 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-emerald-200 hover:text-emerald-800"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-500">Loading category courses...</p>}
      {error && <p className="font-semibold text-red-700">{error}</p>}

      {!loading && !courses.length ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-10 text-center text-slate-500">
          No courses found in this category yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {courses.map((course) => (
            <article
              key={course._id}
              className="group grid gap-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)]"
            >
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
                <h3 className="line-clamp-2 text-base font-bold text-slate-900">{course.title}</h3>
                <p className="line-clamp-2 text-xs leading-5 text-slate-600">{course.subtitle || course.description}</p>
                <p className="text-xs text-slate-500">By {course.instructorId?.firstName || "Instructor"}</p>
                <p className="text-lg font-bold text-slate-900">{course.price > 0 ? `Rs.${course.price}` : "Free"}</p>
                <Link className="sf-btn-primary rounded-xl px-4 py-2 text-center text-sm font-semibold transition" to={`/courses/${course._id}`}>
                  View Course
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
