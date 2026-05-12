import { useEffect, useState } from "react";
import { api } from "../services/api.js";
import { VideoPlayer } from "./VideoPlayer.jsx";

export function CourseVideos({ courseId, refreshKey = 0 }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null);

  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await api.getVideosByCourse(courseId);
        setVideos(response.data.videos || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load videos");
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      loadVideos();
    }
  }, [courseId, refreshKey]);

  if (loading) {
    return <div className="p-6 text-center text-slate-500">Loading videos...</div>;
  }

  if (error) {
    return <div className="rounded-2xl bg-red-50 p-6 text-red-700">{error}</div>;
  }

  if (!videos.length) {
    return (
      <div className="rounded-2xl bg-slate-50 p-8 text-center">
        <p className="font-semibold text-slate-600">No videos available yet</p>
        <p className="mt-2 text-sm text-slate-500">Check back soon for course content</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4">
        {videos.map((video) => (
          <article
            key={video._id}
            className="flex cursor-pointer gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:shadow-lg"
            onClick={() => setSelectedVideo(video)}
          >
            <div className="flex h-24 w-40 min-w-40 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-3xl text-white">
              Play
            </div>

            <div className="flex flex-1 flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{video.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-600">{video.description || "No description"}</p>
              </div>
              <div className="flex gap-4 text-xs text-slate-500">
                {video.duration ? <span>{Math.round(video.duration / 60)} min</span> : null}
                <span>{video.views || 0} views</span>
                {video.instructorId ? <span>By {video.instructorId.firstName} {video.instructorId.lastName || ""}</span> : null}
              </div>
            </div>

            <div className="flex items-center">
              <button type="button" className="rounded-full bg-emerald-700 p-3 text-white transition hover:bg-emerald-800">
                Play
              </button>
            </div>
          </article>
        ))}
      </div>

      {selectedVideo ? <VideoPlayer video={selectedVideo} onClose={() => setSelectedVideo(null)} /> : null}
    </>
  );
}
