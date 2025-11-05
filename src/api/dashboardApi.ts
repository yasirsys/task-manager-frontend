import axiosClient from "./axiosClient";

export const dashboardApi = {
  getCardStatistics: () => axiosClient.get("/dashboard/card-stats"),
  getTaskAnalytics: () => axiosClient.get("/dashboard/analytics"),
};
