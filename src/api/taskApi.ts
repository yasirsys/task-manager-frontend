import axiosClient from "./axiosClient";

import { Task } from "@/types/task";

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
  createTask: (
    taskData: Omit<Task, "_id" | "updatedAt" | "assignedTo"> & {
      assignedTo?: string;
    }
  ) => {
    return axiosClient.post("/tasks", taskData);
  },

  // Update an existing task
  updateTask: (
    id: string,
    taskData: Omit<Task, "_id" | "updatedAt" | "assignedTo"> & {
      assignedTo?: string;
    }
  ) => {
    return axiosClient.patch(`/tasks/${id}`, taskData);
  },

  // Delete a task by ID
  deleteTask: (id: string) => {
    return axiosClient.delete(`/tasks/${id}`);
  },
};
