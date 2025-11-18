import { useEffect, useState } from "react";
import { CheckSquare, Clock, Users, TrendingUp } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { TaskStatus, TaskPriority } from "@/constants/enum";

import { trimText } from "@/utils/textUtils";
import { CardStatistics } from "@/types/dashboard";
import { Task } from "@/types/task";

import { dashboardApi } from "@/api/dashboardApi";

export default function Dashboard() {
  const [cardStatistics, setCardStatistics] = useState<CardStatistics>({
    totalTasks: 0,
    totalCompletedTasks: 0,
    totalInProgressTasks: 0,
    totalUsers: 0,
    totalActiveUsers: 0,
    taskCompletionPercentage: 0,
  });
  const [taskAnalytics, setTaskAnalytics] = useState<{
    latestTasks: Task[];
    taskDistribution: Record<string, number>;
  }>({
    latestTasks: [],
    taskDistribution: {},
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cardStatRes = await dashboardApi.getCardStatistics();
        const taskAnalyticsStatsRes = await dashboardApi.getTaskAnalytics();

        setCardStatistics(cardStatRes.data);
        setTaskAnalytics(taskAnalyticsStatsRes.data);
      } catch (err) {
        setError("Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading)
    return <div className="text-center py-20">Loading dashboard...</div>;

  if (error)
    return <div className="text-center py-20 text-red-500">{error}</div>;

  const statCards = [
    {
      title: "Total Tasks",
      value: cardStatistics.totalTasks,
      icon: CheckSquare,
      description: `${cardStatistics.totalCompletedTasks} completed`,
      color: "text-primary",
    },
    {
      title: "In Progress",
      value: cardStatistics.totalInProgressTasks,
      icon: Clock,
      description: "Active tasks",
      color: "text-warning",
    },
    {
      title: "Total Users",
      value: cardStatistics.totalUsers,
      icon: Users,
      description: `${cardStatistics.totalActiveUsers} active`,
      color: "text-accent",
    },
    {
      title: "Completion Rate",
      value: `${cardStatistics.taskCompletionPercentage}%`,
      icon: TrendingUp,
      description: "Overall progress",
      color: "text-success",
    },
  ];

  const getPriorityColor = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "text-destructive";
      case TaskPriority.MEDIUM:
        return "text-warning";
      case TaskPriority.LOW:
        return "text-accent";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "bg-accent/10 text-accent";
      case TaskStatus.IN_PROGRESS:
        return "bg-warning/10 text-warning";
      case TaskStatus.PENDING:
        return "bg-muted text-muted-foreground";
      case TaskStatus.CANCELLED:
        return "bg-destructive/10 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of your tasks and team
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            {!taskAnalytics.latestTasks?.length ? (
              <div className="text-center text-muted-foreground py-4">
                No tasks available
              </div>
            ) : (
              <div className="space-y-4">
                {taskAnalytics.latestTasks.map((task) => (
                  <div
                    key={task._id}
                    className="flex items-start justify-between border-b pb-4 last:border-0"
                  >
                    <div className="space-y-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="font-medium text-foreground cursor-default">
                              {trimText(task.title, 20)}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{task.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {(task.assignedTo as any)?.name || "Unassigned"}
                        </span>
                      </div>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                        task.status
                      )}`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Task Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {!taskAnalytics.taskDistribution ? (
              <div className="text-center text-muted-foreground py-4">
                No tasks to display
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  {["pending", "in-progress", "completed", "cancelled"].map(
                    (statusKey) => {
                      const statusTasks =
                        taskAnalytics.taskDistribution[statusKey]; // Using taskAnalytics taskDistribution directly
                      return (
                        <div key={statusKey}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">
                              {statusKey}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {statusTasks} tasks
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                statusKey === "pending"
                                  ? "bg-muted-foreground"
                                  : statusKey === "in-progress"
                                  ? "bg-warning"
                                  : statusKey === "completed"
                                  ? "bg-accent"
                                  : "bg-destructive"
                              }`}
                              style={{
                                width: `${
                                  (statusTasks / cardStatistics.totalTasks) *
                                  100
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
