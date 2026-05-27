export const mediaUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
};
