import { useEffect, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "../components/common/confirmationDialog";
import { DataTable } from "@/components/common/dataTable";
import { UserFormModal } from "@/components/common/UserFormModal";

import { useToast } from "@/hooks/use-toast";

import { UserRole, UserStatus } from "@/constants/enum";
import { isValidEmail, isValidPassword } from "@/utils/validation";

import { userApi } from "@/api/userApi";

import { Pagination } from "@/types/shared";
import { User, UserForm } from "@/types/user";

const emptyState: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "user" as User["role"],
  status: "active" as User["status"],
};

export default function Users() {
  const { toast } = useToast();

  const [formData, setFormData] = useState<UserForm>(emptyState);

  const [users, setUsers] = useState<User[]>([]);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [loadingType, setLoadingType] = useState<
    "add" | "edit" | "delete" | null
  >(null);

  const [usersLoading, setUsersLoading] = useState<boolean>(false);
  const [pagination, setPagination] = useState<Pagination>({
    skip: 0,
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 5,
  });

  // --- Fetch all users ---
  const fetchUsers = async (skip: number = 0, limit: number = 5) => {
    setUsersLoading(true);
    try {
      const res = await userApi.getAllPaginated(skip, limit);
      const { users = [], pagination } = res.data;
      setPagination(pagination);
      setUsers(users);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to fetch users",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.skip, pagination.limit);
  }, [pagination.skip, pagination.limit]);

  // --- Create user ---
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }

    if (!isValidEmail(formData.email))
      return toast({
        title: "Invalid Email",
        description: "Invalid email format.",
        variant: "destructive",
      });

    if (!isValidPassword(formData.password))
      return toast({
        title: "Invalid Password",
        description:
          "Password must have min length 8, include at least one uppercase letter, one lowercase letter, and one special character.",
        variant: "destructive",
      });
    setLoadingType("add");
    try {
      await userApi.create(formData);
      toast({ title: "User created" });
      setIsAddDialogOpen(false);
      setFormData({
        name: "",
        email: "",
        role: UserRole.USER,
        password: "",
        status: UserStatus.ACTIVE,
      });
      await fetchUsers(0, pagination.limit);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to create user",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
    }
  };

  // --- Edit user ---
  const openEditDialog = (user: User) => {
    setSelectedUserId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUserId) return;

    setLoadingType("edit");
    try {
      await userApi.update(selectedUserId, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      });
      toast({ title: "User updated" });
      setIsEditDialogOpen(false);
      setSelectedUserId(null);
      await fetchUsers(pagination.skip, pagination.limit);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to update user",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setSelectedUserId(userId);
    setConfirmDialogOpen(true);
  };

  // --- Delete user ---
  const handleDeleteUser = async () => {
    if (!selectedUserId) return;
    setLoadingType("delete");
    try {
      await userApi.delete(selectedUserId);
      toast({ title: "User deleted" });
      await fetchUsers(0, pagination.limit);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to delete user",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoadingType(null);
      setConfirmDialogOpen(false);
      setSelectedUserId(null);
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = pagination.totalPages;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground mt-1">
            Manage team members and permissions
          </p>
        </div>

        {/* Add User Dialog */}
        <UserFormModal
          mode="create"
          triggerText="Add User"
          triggerDisabled={usersLoading}
          open={isAddDialogOpen}
          onOpenChange={(value) => {
            if (value) setFormData(emptyState);
            setIsAddDialogOpen(value);
          }}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateUser}
          loading={loadingType === "add"}
        />
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card">
        <DataTable
          loading={usersLoading}
          data={users}
          emptyMessage="No users available"
          pagination={{
            currentPage,
            totalPages,
            skip: pagination.skip,
            limit: pagination.limit,
            setPagination,
          }}
          columns={[
            { label: "Name", render: (u) => u.name },
            { label: "Email", render: (u) => u.email },
            {
              label: "Role",
              render: (u) => (
                <Badge variant={u.role === "admin" ? "default" : "secondary"}>
                  {u.role}
                </Badge>
              ),
            },
            {
              label: "Status",
              render: (u) => (
                <Badge
                  variant={u.status === "active" ? "default" : "secondary"}
                >
                  {u.status}
                </Badge>
              ),
            },
            {
              label: "Actions",
              className: "text-right",
              render: (u) => (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(u)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => confirmDeleteUser(u._id)}
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
      <UserFormModal
        mode="edit"
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateUser}
        loading={loadingType === "edit"}
      />

      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteUser}
        onCancel={() => setConfirmDialogOpen(false)}
        loading={loadingType === "delete"}
      />
    </div>
  );
}
