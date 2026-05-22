import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";

const initialLectureForm = {
  title: "",
  description: "",
  videoUrl: "",
  durationInSeconds: 0,
  isPreview: false,
};

export function InstructorCourseDetailsPage() {
  const { courseId } = useParams();
  const lectureVideoInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [lectureForm, setLectureForm] = useState(initialLectureForm);
  const [lectureVideoFile, setLectureVideoFile] = useState(null);
  const [isUploadingLectureVideo, setIsUploadingLectureVideo] = useState(false);
  const [isPublishingCourse, setIsPublishingCourse] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCourse = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.getInstructorCourseById(courseId);
      setCourse(response.data.payload);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await api.getInstructorCourseReviews(courseId);
      setReviews(response.data.payload || []);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    loadCourse();
    loadReviews();
  }, [courseId]);

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

  const onLectureVideoSelect = async (event) => {
    const file = event.target.files?.[0];
    setError("");
    setMessage("");

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

  const onAddLecture = async () => {
    setError("");
    setMessage("");

    if (!lectureForm.title.trim()) {
      setError("Lecture title is required");
      return;
    }

    if (!lectureForm.videoUrl) {
      setError("Upload lecture video file before adding lecture");
      return;
    }

    try {
      const order = (course?.lectures?.length || 0) + 1;
      await api.addLectureToCourse(courseId, {
        ...lectureForm,
        title: lectureForm.title.trim(),
        description: lectureForm.description.trim(),
        videoUrl: lectureForm.videoUrl.trim(),
        durationInSeconds: Number(lectureForm.durationInSeconds) || 0,
        order,
      });

      setLectureForm(initialLectureForm);
      setLectureVideoFile(null);
      if (lectureVideoInputRef.current) {
        lectureVideoInputRef.current.value = "";
      }

      setMessage("Lecture added successfully");
      await loadCourse();
      await loadReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add lecture");
    }
  };

  const onDeleteLecture = async (lectureId) => {
    setError("");
    setMessage("");

    try {
      await api.deleteLectureFromCourse(courseId, lectureId);
      setMessage("Lecture deleted");
      await loadCourse();
      await loadReviews();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete lecture");
    }
  };

  const onPublishCourse = async () => {
    if (!course) return;

    setError("");
    setMessage("");
    setIsPublishingCourse(true);

    try {
      await api.updateCourse(courseId, { isPublished: true });
      setMessage("Course published successfully");
      await loadCourse();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to publish course");
    } finally {
      setIsPublishingCourse(false);
    }
  };

  if (loading) {
    return <p>Loading course...</p>;
  }

  if (error && !course) {
    return <p className="font-semibold text-red-700">{error}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900">{course?.title || "Course"}</h1>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${course?.isPublished ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              {course?.isPublished ? "Published" : "Draft"}
            </span>
          </div>
          <p className="text-sm text-slate-500">Manage lecture content for this course.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {!course?.isPublished && (
            <button
              type="button"
              disabled={isPublishingCourse}
              onClick={onPublishCourse}
              className="rounded-full bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300"
            >
              {isPublishingCourse ? "Publishing…" : "Publish Course"}
            </button>
          )}

          <Link
          to="/instructor/dashboard"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <article className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
        <h2 className="text-2xl font-bold text-slate-900">Add Lecture</h2>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Lecture Title
          <input
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            name="title"
            value={lectureForm.title}
            onChange={onLectureChange}
            placeholder="Lecture title"
          />
        </label>

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Lecture Video File
          <input
            ref={lectureVideoInputRef}
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
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

        <label className="grid gap-1 text-sm font-semibold text-slate-700">
          Description
          <textarea
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            name="description"
            value={lectureForm.description}
            onChange={onLectureChange}
            rows="3"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Duration (seconds)
            <input
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
              name="durationInSeconds"
              type="number"
              min="0"
              value={lectureForm.durationInSeconds}
              onChange={onLectureChange}
            />
          </label>

          <label className="flex items-center gap-2 self-end rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
            <input
              name="isPreview"
              type="checkbox"
              checked={lectureForm.isPreview}
              onChange={onLectureChange}
            />
            Preview lecture
          </label>
        </div>

        {error && <p className="font-semibold text-red-700">{error}</p>}
        {message && <p className="font-semibold text-green-700">{message}</p>}

        <button
          type="button"
          onClick={onAddLecture}
          className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800"
        >
          Add Lecture
        </button>
      </article>

      <article className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Course Lectures</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {course?.lectures?.length || 0} lecture{course?.lectures?.length !== 1 ? "s" : ""}
          </span>
        </div>

        {(course?.lectures || []).length ? (
          <div className="grid gap-3">
            {(course.lectures || []).map((lecture, index) => (
              <article
                key={lecture._id || index}
                className="grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[auto_1fr_auto] sm:items-start"
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{lecture.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{lecture.description || "No description"}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-white px-2 py-1">{lecture.durationInSeconds || 0}s</span>
                    <span className="rounded-full bg-white px-2 py-1">{lecture.isPreview ? "Preview" : "Members only"}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onDeleteLecture(lecture._id)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50"
                >
                  Delete
                </button>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">No lectures added yet.</p>
        )}
      </article>

      <article className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Student Reviews</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {reviews.length} review{reviews.length !== 1 ? "s" : ""}
          </span>
        </div>

        {reviews.length ? (
          <div className="grid gap-3">
            {reviews.map((review) => (
              <article key={review._id} className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {review.studentId?.firstName || "Student"} {review.studentId?.lastName || ""}
                    </h3>
                    <p className="text-xs text-slate-500">{review.studentId?.email || ""}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                    {review.rating}/5
                  </span>
                </div>
                <p className="text-sm text-slate-700">{review.comment || "No comment"}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">No reviews yet for this course.</p>
        )}
      </article>
      </div>
    </section>
  );
}
