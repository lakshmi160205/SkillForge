import { Link } from "react-router-dom";

const reasons = [
  {
    title: "Reach learners worldwide",
    description: "Publish once and teach students across multiple roles and learning goals.",
  },
  {
    title: "Create practical courses",
    description: "Upload lectures, set pricing, and manage your content from Instructor Studio.",
  },
  {
    title: "Track growth clearly",
    description: "Monitor enrollments, ratings, and student progress with clean analytics.",
  },
];

export function TeachPage() {
  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="grid gap-6 bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-9 text-white md:grid-cols-[1.1fr_0.9fr] md:px-8">
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Teach on SkillForge</p>
            <h1 className="text-3xl font-bold leading-tight md:text-5xl">Turn your expertise into high-impact online courses</h1>
            <p className="max-w-xl text-sm leading-7 text-white/85 md:text-base">
              Build lessons, publish to the marketplace, and grow as an instructor while helping students build practical skills.
            </p>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-sm font-semibold text-white/90">Get Started</p>
            <p className="mt-1 text-sm text-white/80">Create your instructor account and launch your first course in minutes.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/register" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50">
                Become an Instructor
              </Link>
              <Link to="/instructor/dashboard" className="rounded-full border border-white/25 bg-transparent px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10">
                Open Instructor Studio
              </Link>
            </div>
          </div>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        {reasons.map((reason) => (
          <article key={reason.title} className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
            <h2 className="text-lg font-bold text-slate-900">{reason.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{reason.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
