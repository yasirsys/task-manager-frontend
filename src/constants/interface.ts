import { TaskPriority, TaskStatus } from "./enum";

export interface Task {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  updatedAt: string;
}
