import axiosClient from "./axiosClient";

export const authApi = {
  login: (data: { email: string; password: string }) =>
    axiosClient.post("/auth/login", data),

  signup: (data: { name: string; email: string; password: string }) =>
    axiosClient.post("/auth/signup", data),

  getProfile: () => axiosClient.get("/auth/profile"),

  logout: () => axiosClient.post("/auth/logout"), // optional if backend supports it
};
