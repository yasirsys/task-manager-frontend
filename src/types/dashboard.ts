import { TaskPriority, TaskStatus } from "../constants/enum";

export interface Task {
  _id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  updatedAt: string;
}

export interface CardStatistics {
  totalTasks: number;
  totalCompletedTasks: number;
  totalInProgressTasks: number;
  totalUsers: number;
  totalActiveUsers: number;
  taskCompletionPercentage: number;
}
