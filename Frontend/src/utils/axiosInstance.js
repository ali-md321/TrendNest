import axios from "axios";

const baseURL =
  import.meta.env.MODE === "development"
    ? "/"
    : "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});