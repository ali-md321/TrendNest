import axios from "axios";

const baseURL =
  import.meta.env.MODE === "production"
    ? "/"
    : "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});