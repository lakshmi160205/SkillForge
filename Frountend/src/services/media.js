import { resolveApiBaseUrl } from "./apiBase.js";

export const mediaUrl = (url) => {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  const base = resolveApiBaseUrl();
  if (url.startsWith("/")) return `${base}${url}`;
  return `${base}/${url}`;
};
