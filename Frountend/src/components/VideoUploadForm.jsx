import { useState } from "react";
import { api } from "../services/api.js";

export function VideoUploadForm({ courses, onUploadSuccess }) {
  const [videoFile, setVideoFile] = useState(null);
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [courseName, setCourseName] = useState("");
  const [courseId, setCourseId] = useState("");
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleCourseInput = (event) => {
    const value = event.target.value;
    setCourseName(value);

    if (value.trim()) {
      const filtered = courses.filter((course) =>
        course.title.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredCourses(filtered);
      setShowSuggestions(true);
      if (!filtered.some((course) => course._id === courseId && course.title === value)) {
        setCourseId("");
      }
      return;
    }

    setFilteredCourses([]);
    setShowSuggestions(false);
    setCourseId("");
  };

  const handleSelectCourse = (course) => {
    setCourseName(course.title);
    setCourseId(course._id);
    setFilteredCourses([]);
    setShowSuggestions(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      setVideoFile(null);
      return;
    }

    if (file.size > 500 * 1024 * 1024) {
      setError("File size must be less than 500MB");
      setVideoFile(null);
      return;
    }

    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!videoFile) {
      setError("Please select a video file");
      return;
    }

    if (!videoTitle.trim()) {
      setError("Please enter a video title");
      return;
    }

    if (!courseId) {
      setError("Please select a valid course");
      return;
    }

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("title", videoTitle.trim());
    formData.append("description", videoDescription.trim());
    formData.append("courseId", courseId);

    setLoading(true);
    try {
      const response = await api.uploadVideo(formData);
      setMessage("Video uploaded successfully");
      setVideoFile(null);
      setVideoTitle("");
      setVideoDescription("");
      setCourseName("");
      setCourseId("");

      if (onUploadSuccess) {
        onUploadSuccess(response.data.video);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Video upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg shadow-emerald-950/5">
      <h2 className="text-2xl font-bold text-slate-900">Upload Video</h2>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Course Name
        <div className="relative">
          <input
            type="text"
            value={courseName}
            onChange={handleCourseInput}
            onFocus={() => courseName && setShowSuggestions(true)}
            placeholder="Type course name"
            className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
            required
          />

          {showSuggestions && filteredCourses.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
              {filteredCourses.map((course) => (
                <button
                  key={course._id}
                  type="button"
                  onClick={() => handleSelectCourse(course)}
                  className="w-full border-b border-slate-100 px-3 py-2 text-left text-sm transition hover:bg-emerald-50 last:border-b-0"
                >
                  {course.title}
                </button>
              ))}
            </div>
          )}

          {courseId && <p className="mt-1 text-xs text-green-600">Selected course</p>}
        </div>
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Video Title
        <input
          type="text"
          value={videoTitle}
          onChange={(event) => setVideoTitle(event.target.value)}
          placeholder="Enter video title"
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          required
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Description
        <textarea
          value={videoDescription}
          onChange={(event) => setVideoDescription(event.target.value)}
          placeholder="Enter video description (optional)"
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          rows="3"
        />
      </label>

      <label className="grid gap-1 text-sm font-semibold text-slate-700">
        Video File
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-sm outline-none ring-emerald-200 focus:ring"
          disabled={loading}
          required
        />
        {videoFile && (
          <p className="mt-1 text-xs text-slate-500">
            Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </label>

      {error && <p className="font-semibold text-red-700">{error}</p>}
      {message && <p className="font-semibold text-green-700">{message}</p>}

      <button
        type="submit"
        disabled={loading || !videoFile}
        className="w-fit rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-400"
      >
        {loading ? "Uploading..." : "Upload Video"}
      </button>
    </form>
  );
}
