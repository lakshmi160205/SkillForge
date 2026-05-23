import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api.js";

const initialForm = {
  title: "",
  subtitle: "",
  description: "",
  thumbnailUrl: "",
  category: "Programming",
  level: "BEGINNER",
  language: "English",
  price: 0,
  isPublished: false,
  lectures: [],
};

const initialLectureForm = {
  title: "",
  description: "",
  videoUrl: "",
  durationInSeconds: 0,
  isPreview: false,
};

export function InstructorDashboardPage() {
  const lectureVideoInputRef = useRef(null);
  const [dashboard, setDashboard] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [lectureForm, setLectureForm] = useState(initialLectureForm);
  const [lectureVideoFile, setLectureVideoFile] = useState(null);
  const [isUploadingLectureVideo, setIsUploadingLectureVideo] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [publishingCourseId, setPublishingCourseId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.getInstructorDashboard();
      setDashboard(response.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onChange = (event) => {
    const { name, value, valueAsNumber } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "price"
          ? value === ""
            ? ""
            : Number.isFinite(valueAsNumber)
            ? valueAsNumber
            : Number(value)
          : value,
    }));
  };

  const onLectureChange = (event) => {
    const { name, type, value, checked } = event.target;
    setLectureForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "durationInSeconds"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    }));
  };

  const onAddLecture = () => {
    if (!lectureForm.title.trim()) {
      setError("Lecture title is required");
      setMessage("");
      return;
    }

    if (!lectureForm.videoUrl) {
      setError("Upload lecture video file before adding lecture");
      setMessage("");
      return;
    }

    setForm((prev) => ({
      ...prev,
      lectures: [
        ...prev.lectures,
        {
          ...lectureForm,
          title: lectureForm.title.trim(),
          description: lectureForm.description.trim(),
          videoUrl: lectureForm.videoUrl.trim(),
          order: prev.lectures.length + 1,
        },
      ],
    }));
    setLectureForm(initialLectureForm);
    setLectureVideoFile(null);
    if (lectureVideoInputRef.current) {
      lectureVideoInputRef.current.value = "";
    }
    setError("");
    setMessage("Lecture added successfully");
  };

  const onLectureVideoSelect = async (event) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setLectureVideoFile(null);
      setLectureForm((prev) => ({ ...prev, videoUrl: "", durationInSeconds: 0 }));
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError("Lecture video must be less than 500MB");
      return;
    }

    setLectureVideoFile(file);
    setIsUploadingLectureVideo(true);

    try {
      const payload = new FormData();
      payload.append("video", file);
      payload.append("title", lectureForm.title || file.name);

      const response = await api.uploadTempLectureVideo(payload);
      const uploaded = response.data?.payload;

      setLectureForm((prev) => ({
        ...prev,
        videoUrl: uploaded?.videoUrl || "",
        durationInSeconds: uploaded?.durationInSeconds || prev.durationInSeconds,
      }));
      setMessage("Lecture video uploaded");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload lecture video");
      setLectureVideoFile(null);
      setLectureForm((prev) => ({ ...prev, videoUrl: "" }));
    } finally {
      setIsUploadingLectureVideo(false);
    }
  };

  const onRemoveLecture = (indexToRemove) => {
    setForm((prev) => ({
      ...prev,
      lectures: prev.lectures
        .filter((_, index) => index !== indexToRemove)
        .map((lecture, index) => ({ ...lecture, order: index + 1 })),
    }));
  };

  const onThumbnailSelect = async (event) => {
    const file = event.target.files?.[0];
    setError("");

    if (!file) {
      setThumbnailFile(null);
      return;
    }

    setThumbnailFile(file);
    setIsUploadingThumbnail(true);

    try {
      const response = await api.uploadCourseThumbnail(file);
      const uploadedUrl = response.data?.payload?.thumbnailUrl || "";
      setForm((prev) => ({ ...prev, thumbnailUrl: uploadedUrl }));
      setMessage("Thumbnail uploaded successfully");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload thumbnail");
    } finally {
      setIsUploadingThumbnail(false);
    }
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        lectures: form.lectures.map((l) => ({
          ...l,
          durationInSeconds: Number(l.durationInSeconds) || 0,
        })),
      };
      await api.createCourse(payload);
      setMessage("Course created successfully");
      setForm(initialForm);
      setLectureForm(initialLectureForm);
      setLectureVideoFile(null);
      if (lectureVideoInputRef.current) {
        lectureVideoInputRef.current.value = "";
      }
      setThumbnailFile(null);
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create course");
    }
  };

  const onPublishCourse = async (courseId) => {
    setError("");
    setMessage("");
    setPublishingCourseId(courseId);

    try {
      await api.updateCourse(courseId, { isPublished: true });
      setMessage("Course published successfully");
      await loadDashboard();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish course");
    } finally {
      setPublishingCourseId(null);
    }
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <section className="space-y-6">
      <article className="overflow-hidden rounded-4xl border border-emerald-100 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
        <div className="bg-linear-to-r from-emerald-900 via-emerald-800 to-emerald-700 px-6 py-8 text-white md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/80">Instructor Studio</p>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Build, publish, and scale your courses</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/85 md:text-base">
            Manage content pipeline from draft lectures to published learning experiences.
          </p>
        </div>
      </article>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Total Courses</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Published</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.publishedCourses || 0}</p>
        </article>
        <article className="grid gap-1 rounded-2xl border border-emerald-100 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
          <h3 className="text-sm font-semibold text-slate-500">Total Students</h3>
          <p className="text-3xl font-bold text-emerald-800">{dashboard?.totalStudents || 0}</p>
        </article>
      </div>

      <form className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-[0_10px_24px_rgba(15,23,42,0.06)]" onSubmit={onSubmit}>
        <h2 className="text-2xl font-bold text-slate-900">Create Course</h2>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Title
          <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring" name="title" value={form.title} onChange={onChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Subtitle
          <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring" name="subtitle" value={form.subtitle} onChange={onChange} />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Description
          <textarea className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring" name="description" value={form.description} onChange={onChange} required />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Thumbnail Image
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            type="file"
            accept="image/*"
            onChange={onThumbnailSelect}
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Thumbnail URL (auto-filled after upload)
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            name="thumbnailUrl"
            type="url"
            value={form.thumbnailUrl}
            onChange={onChange}
            placeholder="https://example.com/course-thumbnail.jpg"
          />
        </label>

        {isUploadingThumbnail && <p className="text-sm text-slate-500">Uploading thumbnail...</p>}
        {thumbnailFile && !isUploadingThumbnail && <p className="text-sm text-slate-500">Selected file: {thumbnailFile.name}</p>}

        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Category
            <input className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring" name="category" value={form.category} onChange={onChange} required />
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Level
            <select className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring" name="level" value={form.level} onChange={onChange}>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Price
            <input
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
              name="price"
              type="number"
              value={form.price}
              onChange={onChange}
              min="0"
              step="1"
              inputMode="numeric"
            />
          </label>
        </div>

        <div className="grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Lectures</h3>
              <p className="text-sm text-slate-500">Add lectures before publishing the course.</p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
              {form.lectures.length} lecture{form.lectures.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Lecture Title
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                name="title"
                value={lectureForm.title}
                onChange={onLectureChange}
                placeholder="Introduction to the course"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Lecture Video File
              <input
                ref={lectureVideoInputRef}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                type="file"
                accept="video/*"
                onChange={onLectureVideoSelect}
                disabled={isUploadingLectureVideo}
              />
              {isUploadingLectureVideo && <span className="text-xs font-normal text-slate-500">Uploading lecture video...</span>}
              {!isUploadingLectureVideo && lectureVideoFile && lectureForm.videoUrl && (
                <span className="text-xs font-normal text-green-700">Uploaded: {lectureVideoFile.name}</span>
              )}
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700 md:col-span-2">
              Lecture Description
              <textarea
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                name="description"
                value={lectureForm.description}
                onChange={onLectureChange}
                placeholder="What students will learn in this lecture"
                rows="3"
              />
            </label>

            <label className="grid gap-1 text-sm font-semibold text-slate-700">
              Duration (seconds)
              <input
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
                name="durationInSeconds"
                type="number"
                min="0"
                value={lectureForm.durationInSeconds}
                onChange={onLectureChange}
              />
            </label>

            <label className="flex items-center gap-2 self-end rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700">
              <input
                name="isPreview"
                type="checkbox"
                checked={lectureForm.isPreview}
                onChange={onLectureChange}
              />
              Preview lecture
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
              onClick={onAddLecture}
            >
              Add Lecture
            </button>


            
            <p className="text-xs text-slate-500">Each lecture is saved to the course in the order listed below.</p>
          </div>

          {form.lectures.length > 0 && (
            <div className="grid gap-3">
              {form.lectures.map((lecture, index) => (
                <article key={`${lecture.title}-${index}`} className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {lecture.order}. {lecture.title}
                      </p>
                      {lecture.description && <p className="mt-1 text-xs text-slate-500">{lecture.description}</p>}
                    </div>
                    <button
                      type="button"
                      className="text-xs font-semibold text-red-600 transition hover:text-red-700"
                      onClick={() => onRemoveLecture(index)}
                    >
                      Remove
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{lecture.durationInSeconds || 0}s</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{lecture.isPreview ? "Preview" : "Members only"}</span>
                    {lecture.videoUrl && <span className="truncate rounded-full bg-slate-100 px-2 py-1">Video attached</span>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <input
            name="isPublished"
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
          />
          Publish course now
        </label>

        {error && <p className="font-semibold text-red-700">{error}</p>}
        {message && <p className="font-semibold text-green-700">{message}</p>}

        <button type="submit" className="sf-btn-primary w-fit rounded-lg px-3 py-2 text-sm font-semibold transition">
          Create Course
        </button>
      </form>

      <h2 className="text-2xl font-bold text-slate-900">My Courses</h2>

      <h3 className="text-lg font-semibold text-slate-800">Published</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{
        (dashboard?.courses || []).filter((c) => c.isPublished).map((course) => (
          <Link
            key={course._id}
            to={`/instructor/courses/${course._id}`}
            className="grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-emerald-100 bg-white p-4 shadow-lg shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-xl"
          >
            {course.thumbnailUrl ? (
              <img
                src={course.thumbnailUrl}
                alt={`${course.title} thumbnail`}
                className="h-36 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="grid h-36 w-full place-items-center rounded-xl bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                No Thumbnail
              </div>
            )}

            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">{course.category || "Uncategorized"}</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{course.level || "—"}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${course.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                {course.isPublished ? "Published" : "Draft"}
              </span>
            </div>

            <div>
              <h3 className="break-all text-base font-bold text-slate-900">{course.title}</h3>
              {course.subtitle && <p className="mt-0.5 break-all text-xs text-slate-500">{course.subtitle}</p>}
            </div>

            <p className="line-clamp-2 break-all text-xs leading-5 text-slate-600">{course.description}</p>

            <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
              <div>
                <p className="font-bold text-emerald-800">{course.totalEnrollments || 0}</p>
                <p className="text-slate-500">Students</p>
              </div>
              <div>
                <p className="font-bold text-emerald-800">{course.averageRating || 0} / 5</p>
                <p className="text-slate-500">Rating</p>
              </div>
              <div>
                <p className="font-bold text-emerald-800">{course.price > 0 ? `Rs.${course.price}` : "Free"}</p>
                <p className="text-slate-500">Price</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{course.language || "English"}</span>
              <span>{course.lectures?.length || 0} lecture{course.lectures?.length !== 1 ? "s" : ""}</span>
            </div>
          </Link>
        ))
      }</div>

      <h3 className="mt-6 text-lg font-semibold text-slate-800">Drafts</h3>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{
        (dashboard?.courses || []).filter((c) => !c.isPublished).map((course) => (
          <article
            key={course._id}
            className="grid min-w-0 gap-3 overflow-hidden rounded-2xl border border-amber-100 bg-white p-4 shadow-lg shadow-emerald-950/5 transition hover:-translate-y-0.5 hover:border-amber-200 hover:shadow-xl"
          >
            <Link
              to={`/instructor/courses/${course._id}`}
              className="grid min-w-0 gap-3"
            >
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={`${course.title} thumbnail`}
                  className="h-36 w-full rounded-xl object-cover"
                />
              ) : (
                <div className="grid h-36 w-full place-items-center rounded-xl bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  No Thumbnail
                </div>
              )}

              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">{course.category || "Uncategorized"}</span>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{course.level || "—"}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${course.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>

              <div>
                <h3 className="break-all text-base font-bold text-slate-900">{course.title}</h3>
                {course.subtitle && <p className="mt-0.5 break-all text-xs text-slate-500">{course.subtitle}</p>}
              </div>

              <p className="line-clamp-2 break-all text-xs leading-5 text-slate-600">{course.description}</p>

              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-50 p-3 text-center text-xs">
                <div>
                  <p className="font-bold text-emerald-800">{course.totalEnrollments || 0}</p>
                  <p className="text-slate-500">Students</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-800">{course.averageRating || 0} / 5</p>
                  <p className="text-slate-500">Rating</p>
                </div>
                <div>
                  <p className="font-bold text-emerald-800">{course.price > 0 ? `Rs.${course.price}` : "Free"}</p>
                  <p className="text-slate-500">Price</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{course.language || "English"}</span>
                <span>{course.lectures?.length || 0} lecture{course.lectures?.length !== 1 ? "s" : ""}</span>
              </div>
            </Link>

            <button
              type="button"
              disabled={publishingCourseId === course._id}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onPublishCourse(course._id);
              }}
              className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {publishingCourseId === course._id ? "Publishing…" : "Publish Course"}
            </button>
          </article>
        ))
      }</div>

    </section>
  );
}
