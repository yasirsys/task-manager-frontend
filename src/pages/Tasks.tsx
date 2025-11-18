import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirmationDialog";
import { DataTable } from "@/components/common/dataTable";

import { Textarea } from "@/components/ui/textarea";

import { useToast } from "@/hooks/use-toast";

import { tasksApi } from "@/api/taskApi";
import { userApi } from "@/api/userApi";

import { TaskPriority, TaskStatus } from "@/constants/enum";
import { Task } from "@/types/task";

const emptyForm = {
  title: "",
  description: "",
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  assignedTo: "",
};

export default function Tasks() {
  const { toast } = useToast();

  const [formData, setFormData] = useState(emptyForm);

  const [users, setUsers] = useState<Array<{ _id: string; name: string }>>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<
    "add" | "edit" | "delete" | null
  >(null);

  // pagination & loading
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 5,
  });

  useEffect(() => {
    // Fetch users for assignment
    const fetchUsers = async () => {
      try {
        const res = await userApi.getAll();
        setUsers(res.data);
      } catch (err) {
        console.error("Failed to fetch users for task assignment", err);
      }
    };
    fetchUsers();
  }, []);
  // Fetch tasks on page load
  const fetchTasks = async (skip: number, limit: number) => {
    setTasksLoading(true);
    try {
      const response = await tasksApi.getTasks(skip, limit);
      const { tasks = [], pagination } = response.data;
      setTasks(tasks);
      setPagination(pagination);
    } catch (err: any) {
      console.error("Failed to load tasks:", err);
      toast({
        title: "Failed to load tasks",
        description: err?.response?.data?.message || "Could not fetch tasks",
        variant: "destructive",
      });
    } finally {
      setTasksLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks(pagination.skip, pagination.limit);
  }, [pagination.skip, pagination.limit]);

  console.log({ formData, tasks });
  // Handlers for adding, editing, and deleting tasks
  const handleAdd = async () => {
    if (!formData.title?.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }

    setLoadingType("add");
    try {
      await tasksApi.createTask(formData);
      toast({ title: "Task created" });
      setIsAddDialogOpen(false);
      setFormData(emptyForm);
      fetchTasks(0, pagination.limit); // Refresh task list
    } catch (err: any) {
      console.error("Create task error", err);
      toast({
        title: "Failed to create task",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
    }
  };

  const handleEdit = async () => {
    if (!selectedTaskId) return;

    setLoadingType("edit");
    try {
      await tasksApi.updateTask(selectedTaskId, formData);
      toast({ title: "Task updated" });
      setIsEditDialogOpen(false);
      setSelectedTaskId(null);
      setFormData(emptyForm);
      fetchTasks(pagination.skip, pagination.limit); // Refresh task list
    } catch (err: any) {
      console.error("Update task error", err);
      toast({
        title: "Failed to update task",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
    }
  };

  const confirmDeleteTask = (taskId: string) => {
    setSelectedTaskId(taskId);
    setConfirmDialogOpen(true);
  };

  const handleDeleteTask = async () => {
    if (!selectedTaskId) return;
    setLoadingType("delete");
    try {
      await tasksApi.deleteTask(selectedTaskId);
      toast({ title: "Task deleted" });
      fetchTasks(0, pagination.limit); // Refresh task list
    } catch (err: any) {
      console.error("Delete task error", err);
      toast({
        title: "Failed to delete task",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
      setConfirmDialogOpen(false);
      setSelectedTaskId(null);
    }
  };

  const openEditDialog = (task: Task) => {
    setSelectedTaskId(task._id);
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      assignedTo: (task.assignedTo as any)._id || "",
    });
    setIsEditDialogOpen(true);
  };

  const getPriorityVariant = (priority: TaskPriority) => {
    switch (priority) {
      case TaskPriority.HIGH:
        return "destructive";
      case TaskPriority.MEDIUM:
        return "default";
      case TaskPriority.LOW:
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusVariant = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return "default";
      case TaskStatus.IN_PROGRESS:
        return "secondary";
      case TaskStatus.CANCELLED:
        return "destructive";
      default:
        return "outline";
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = pagination.totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tasks</h1>
          <p className="text-muted-foreground mt-1">
            Manage and track all your tasks
          </p>
        </div>

        {/* Add Task Dialog */}
        {/* ToDo: Make This Modal A Reusable Component */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Task</DialogTitle>
              <DialogDescription>
                Create a new task and assign it to a team member
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Enter task title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Enter task description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: Task["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: Task["priority"]) =>
                      setFormData({ ...formData, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.LOW}>Low</SelectItem>
                      <SelectItem value={TaskPriority.MEDIUM}>
                        Medium
                      </SelectItem>
                      <SelectItem value={TaskPriority.HIGH}>High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Select
                  value={formData.assignedTo}
                  onValueChange={(value) =>
                    setFormData({ ...formData, assignedTo: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleAdd}
                className="w-full"
                disabled={loadingType === "add"}
              >
                {loadingType === "add" ? "Creating…" : "Create Task"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <DataTable
          loading={tasksLoading}
          data={tasks}
          emptyMessage="No tasks available"
          pagination={{
            currentPage,
            totalPages,
            skip: pagination.skip,
            limit: pagination.limit,
            setPagination,
          }}
          columns={[
            {
              label: "Title",
              render: (task) => (
                <div>
                  <div className="font-medium">{task.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {task.description}
                  </div>
                </div>
              ),
            },
            {
              label: "Status",
              render: (task) => (
                <Badge variant={getStatusVariant(task.status)}>
                  {task.status}
                </Badge>
              ),
            },
            {
              label: "Priority",
              render: (task) => (
                <Badge variant={getPriorityVariant(task.priority)}>
                  {task.priority}
                </Badge>
              ),
            },
            {
              label: "Assigned To",
              render: (task) => task.assignedTo?.name || "--",
            },
            {
              label: "Actions",
              className: "text-right",
              render: (task) => (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDeleteTask(task._id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* Edit Dialog */}
      {/* ToDo: Make This Modal A Reusable Component */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: Task["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: Task["priority"]) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignedTo">Assigned To</Label>
              <Select
                value={formData.assignedTo}
                onValueChange={(value) => {
                  setFormData({ ...formData, assignedTo: value });
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleEdit}
              className="w-full"
              disabled={loadingType === "edit"}
            >
              {loadingType === "edit" ? "Updating…" : "Update Task"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteTask}
        onCancel={() => setConfirmDialogOpen(false)}
        loading={loadingType === "delete"}
      />
    </div>
  );
}
