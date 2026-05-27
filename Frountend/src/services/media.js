export const mediaUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = import.meta.env.VITE_API_BASE_URL || "https://skillforge-7yrt.onrender.com";
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
};
