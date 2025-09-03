import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// In development we keep requests relative (dev proxy in vite.config.js).
// In production we prefer an explicit VITE_API_URL (set in Vercel).
const baseURL =
  import.meta.env.MODE === "development" ? "/" : (API_URL || "/");

if (import.meta.env.MODE !== "development" && !API_URL) {
  console.warn(
    "VITE_API_URL is not set. Set VITE_API_URL in production environment variables to your backend URL."
  );
}

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});