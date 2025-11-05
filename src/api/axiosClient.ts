import axios from "axios";

// Create instance
const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // adjust as needed
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// Request interceptor — attach token if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle errors globally
axiosClient.interceptors.response.use(
  (response) => response.data, // always return only data
  async (error) => {
    if (error.response) {
      // 401 Unauthorized → token expired or invalid
      if (error.response.status === 401) {
        console.warn("Unauthorized! Redirecting to login...");

        const currentPath = window.location.pathname;
        if (currentPath !== "/login") {
          localStorage.removeItem("accessToken");
          window.location.href = "/login";
        }
      }

      // 403 Forbidden
      if (error.response.status === 403) {
        console.warn("Access denied!");
      }
    }

    // Any other errors
    return Promise.reject(error);
  }
);

export default axiosClient;
