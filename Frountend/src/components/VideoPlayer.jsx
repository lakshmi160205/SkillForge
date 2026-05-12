import { useState } from "react";

export function VideoPlayer({ video, onClose }) {
  const [error, setError] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl">
        <div className="flex items-center justify-between bg-slate-900 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{video.title}</h3>
          <button type="button" onClick={onClose} className="text-2xl text-white transition hover:text-slate-300">
            x
          </button>
        </div>

        <div className="flex aspect-video items-center justify-center bg-black">
          {error ? (
            <div className="text-center text-white">
              <p className="mb-2 text-lg font-semibold">Unable to load video</p>
              <p className="text-sm text-slate-400">{error}</p>
            </div>
          ) : (
            <video controls className="h-full w-full" onError={() => setError("Failed to load video")}>
              <source src={video.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        <div className="space-y-3 bg-slate-950 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-400">Description</p>
            <p className="mt-1 text-sm text-slate-200">{video.description || "No description"}</p>
          </div>
          <div className="flex gap-4 text-xs text-slate-400">
            {video.duration ? <span>Duration: {Math.round(video.duration / 60)} min</span> : null}
            <span>Views: {video.views || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
