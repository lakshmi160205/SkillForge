const DEFAULT_API_BASE_URL = "https://skillforge-7yrt.onrender.com";

const isLocalhostUrl = (value) => typeof value === "string" && /^https?:\/\/localhost(?::\d+)?(?:\/|$)/i.test(value);

export const resolveApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  const isLocalDev = typeof window !== "undefined" && /^localhost$/i.test(window.location.hostname);

  if (configuredBaseUrl && (!isLocalhostUrl(configuredBaseUrl) || isLocalDev)) {
    return configuredBaseUrl;
  }

  return DEFAULT_API_BASE_URL;
};
