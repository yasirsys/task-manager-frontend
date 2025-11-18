import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/common/confirmationDialog";
import { DataTable } from "@/components/common/dataTable";

import { TaskFormModal } from "@/components/common/taskFormModal";

import { useToast } from "@/hooks/use-toast";

import { tasksApi } from "@/api/taskApi";
import { userApi } from "@/api/userApi";

import { TaskPriority, TaskStatus } from "@/constants/enum";
import { Pagination } from "@/types/shared";
import { Task, TaskForm } from "@/types/task";

const emptyForm: TaskForm = {
  title: "",
  description: "",
  status: TaskStatus.PENDING,
  priority: TaskPriority.MEDIUM,
  assignedTo: "",
};

export default function Tasks() {
  const { toast } = useToast();

  const [formData, setFormData] = useState<TaskForm>(emptyForm);

  const [users, setUsers] = useState<Array<{ _id: string; name: string }>>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<
    "add" | "edit" | "delete" | null
  >(null);

  // pagination & loading
  const [tasksLoading, setTasksLoading] = useState<boolean>(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
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
        <TaskFormModal
          open={isAddDialogOpen}
          setOpen={setIsAddDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleAdd}
          loading={loadingType === "add"}
          title="Add New Task"
          description="Create a new task and assign it to a team member"
          triggerButton={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          }
          users={users}
        />
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
      <TaskFormModal
        open={isEditDialogOpen}
        setOpen={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleEdit}
        loading={loadingType === "edit"}
        title="Edit Task"
        description="Update task details"
        users={users}
      />

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
