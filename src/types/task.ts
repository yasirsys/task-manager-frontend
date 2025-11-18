import { TaskPriority, TaskStatus } from "../constants/enum";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: {
    _id: string;
    name: string;
    email: string;
  };
  updatedAt: string;
}

export interface TaskForm {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string; // user ID
}
