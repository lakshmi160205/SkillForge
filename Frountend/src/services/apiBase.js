const isLocalhostUrl = (value) =>
  typeof value === "string" && /^https?:\/\/localhost(?::\d+)?(?:\/|$)/i.test(value);

export const resolveApiBaseUrl = () => {
  // Primary env name: VITE_API_URL (set in Vercel). Keep VITE_API_BASE_URL as fallback for older setups.
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  const isLocalDev = typeof window !== "undefined" && /^localhost$/i.test(window.location.hostname);

  if (envUrl && (!isLocalhostUrl(envUrl) || isLocalDev)) return envUrl;

  // Last resort fallback to the deployed backend URL
  return "https://skillforge-7yrt.onrender.com";
};
