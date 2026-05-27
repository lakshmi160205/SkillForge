import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api.js";
import { mediaUrl } from "../services/media.js";

export function StudentCourseLecturesPage() {
  const { courseId } = useParams();
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const response = await api.getStudentCourseProgress(courseId);
        setProgressData(response.data.payload);
      } catch (err) {
        setLoadError(err.response?.data?.message || "Failed to load course lectures");
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      load();
    }
  }, [courseId]);

  const course = progressData?.courseId;
  const lectures = course?.lectures || [];
  const selectedLecture = lectures.find((lecture) => String(lecture._id) === selectedLectureId);
  const completedLectureIds = (progressData?.completedLectureIds || []).map((id) => String(id));
  const progressPercentage = progressData?.progressPercentage || 0;

  useEffect(() => {
    if (!lectures.length) {
      setSelectedLectureId("");
      return;
    }

    const hasCurrentSelection = lectures.some((lecture) => String(lecture._id) === selectedLectureId);
    if (hasCurrentSelection) {
      return;
    }

    const firstPlayableLecture = lectures.find((lecture) => lecture.videoUrl);
    const defaultLecture = firstPlayableLecture || lectures[0];
    setSelectedLectureId(String(defaultLecture._id));
  }, [lectures, selectedLectureId]);

  const updateProgress = async (nextCompletedLectureIds) => {
    setActionError("");
    setMessage("");
    setIsUpdatingProgress(true);

    try {
      const response = await api.updateProgress(courseId, {
        completedLectureIds: [...new Set(nextCompletedLectureIds)],
      });

      const payload = response.data?.payload || {};

      setProgressData((prev) => ({
        ...prev,
        completedLectureIds: payload.completedLectureIds || [],
        progressPercentage: payload.progressPercentage || 0,
        lastAccessedAt: payload.lastAccessedAt,
        completedAt: payload.completedAt,
      }));

      const nextPercentage = payload.progressPercentage || 0;
      setMessage(nextPercentage === 100 ? "Course completed. Progress is 100%." : "Progress updated.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to update progress");
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const onVideoEnded = async () => {
    if (!selectedLecture?._id) {
      return;
    }

    const id = String(selectedLecture._id);
    if (completedLectureIds.includes(id)) {
      return;
    }

    await updateProgress([...completedLectureIds, id]);
  };

  const onReviewChange = (event) => {
    const { name, value } = event.target;
    setReviewForm((prev) => ({
      ...prev,
      [name]: name === "rating" ? Number(value) : value,
    }));
  };

  const onSubmitReview = async (event) => {
    event.preventDefault();
    setActionError("");
    setMessage("");
    setIsSubmittingReview(true);

    try {
      await api.submitCourseReview(courseId, {
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setMessage("Review submitted successfully.");
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (loading) {
    return <p>Loading lectures...</p>;
  }

  if (loadError) {
    return <p className="font-semibold text-red-700">{loadError}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{course?.title || "Course Lectures"}</h1>
          <p className="text-sm text-slate-500">Access is available because you are enrolled in this course.</p>
        </div>
        <Link
          to="/student/dashboard"
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Back to Dashboard
        </Link>
      </div>

      <article className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)]">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Lecture Player</h2>
          <p className="text-sm text-slate-500">Choose a lecture from the list below to play that specific video.</p>
        </div>

        <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between text-sm font-semibold text-slate-700">
            <span>Course Progress</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-linear-to-r from-emerald-500 to-emerald-700 transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <p className="text-xs text-slate-500">
            Completed {completedLectureIds.length} of {lectures.length} lectures.
          </p>
        </div>

        {selectedLecture?.videoUrl ? (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900">Now Playing: {selectedLecture.title}</h3>
            <video key={selectedLectureId} controls onEnded={onVideoEnded} className="aspect-video w-full rounded-2xl bg-black">
                      <source src={mediaUrl(selectedLecture.videoUrl)} type="video/mp4" />
              Your browser does not support the video tag.
            </video>

            <p className="text-xs font-semibold text-slate-500">
              Progress updates automatically when this lecture video finishes.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl bg-slate-50 p-5 text-slate-600">
            This lecture does not have a video yet. Choose another lecture.
          </div>
        )}

        {actionError && <p className="font-semibold text-red-700">{actionError}</p>}
        {message && <p className="font-semibold text-green-700">{message}</p>}
      </article>

      <article className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)]">
        <h2 className="text-2xl font-bold text-slate-900">Lecture List</h2>

        {lectures.length ? (
          <div className="grid gap-3">
            {lectures.map((lecture, index) => (
              <button
                key={lecture._id || index}
                type="button"
                onClick={() => setSelectedLectureId(String(lecture._id))}
                className={`grid gap-3 rounded-2xl border p-4 text-left transition sm:grid-cols-[auto_1fr_auto] sm:items-start ${
                  String(lecture._id) === selectedLectureId
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-slate-200 bg-slate-50 hover:border-emerald-200"
                }`}
              >
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-sm font-bold text-emerald-800">
                  {index + 1}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{lecture.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{lecture.description || "No description"}</p>
                  {completedLectureIds.includes(String(lecture._id)) && (
                    <p className="mt-2 text-xs font-semibold text-green-700">Completed</p>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-500 sm:text-right">
                  {lecture.durationInSeconds || 0}s
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl bg-slate-50 p-4 text-slate-600">No lectures found for this course yet.</p>
        )}
      </article>

      <article className="space-y-3 rounded-3xl border border-emerald-100 bg-white p-5 shadow-[0_18px_40px_rgba(6,95,70,0.06)]">
        <h2 className="text-2xl font-bold text-slate-900">Your Review</h2>
        <p className="text-sm text-slate-500">Share your feedback for this course. You can update it anytime.</p>

        <form className="grid gap-3" onSubmit={onSubmitReview}>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Rating
            <select
              name="rating"
              value={reviewForm.rating}
              onChange={onReviewChange}
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            >
              <option value={5}>5 - Excellent</option>
              <option value={4}>4 - Very good</option>
              <option value={3}>3 - Good</option>
              <option value={2}>2 - Fair</option>
              <option value={1}>1 - Poor</option>
            </select>
          </label>

          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Comment
            <textarea
              name="comment"
              value={reviewForm.comment}
              onChange={onReviewChange}
              rows="4"
              placeholder="Write your feedback..."
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            />
          </label>

          <button
            type="submit"
            disabled={isSubmittingReview}
            className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmittingReview ? "Saving..." : "Submit Review"}
          </button>
        </form>
      </article>
    </section>
  );
}
