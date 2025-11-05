import axiosClient from "./axiosClient";

// Create or update the base URL for the tasks endpoint
export const tasksApi = {
  // Get tasks with pagination
  getTasks: (skip: number = 0, limit: number = 10) => {
    return axiosClient.get("/tasks", {
      params: { skip, limit }, // Passing page and limit as query params
    });
  },

  // Get a single task by ID
  getTaskById: (id: string) => {
    return axiosClient.get(`/tasks/${id}`);
  },

  // Create a new task
  createTask: (taskData: any) => {
    return axiosClient.post("/tasks", taskData);
  },

  // Update an existing task
  updateTask: (id: string, taskData: any) => {
    return axiosClient.patch(`/tasks/${id}`, taskData);
  },

  // Delete a task by ID
  deleteTask: (id: string) => {
    return axiosClient.delete(`/tasks/${id}`);
  },
};
