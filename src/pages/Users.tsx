import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";

import { useToast } from "@/hooks/use-toast";

import { userApi } from "@/api/userApi";

import { UserRole, UserStatus } from "@/constants/enum";
import { isValidEmail, isValidPassword } from "@/utils/validation";
import { ConfirmDialog } from "@/components/common/confirmationDialog";

type AppUser = {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
};

export default function Users() {
  const { toast } = useToast();

  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [pagination, setPagination] = useState({
    skip: 0,
    total: 0,
    totalPages: 0,
    page: 1,
    limit: 5,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user" as AppUser["role"],
    status: "active" as AppUser["status"],
  });

  // --- Fetch all users ---
  const fetchUsers = async (skip: number = 0, limit: number = 5) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.skip, pagination.limit);
  }, [pagination.skip, pagination.limit]);

  // --- Create user ---
  const handleAdd = async () => {
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
    }
  };

  // --- Edit user ---
  const openEditDialog = (user: AppUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: "",
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;

    try {
      await userApi.update(editingUser._id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
      });
      toast({ title: "User updated" });
      setIsEditDialogOpen(false);
      setEditingUser(null);
      await fetchUsers(pagination.skip, pagination.limit);
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Failed to update user",
        description: err?.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const confirmDeleteUser = (userId: string) => {
    setUserToDelete(userId);
    setConfirmDialogOpen(true);
  };

  // --- Delete user ---
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    setDeleting(true);
    try {
      await userApi.delete(userToDelete);
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
      setDeleting(false);
      setConfirmDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const currentPage = Math.floor(pagination.skip / pagination.limit) + 1;
  const totalPages = pagination.totalPages;

  console.log("users", users);
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
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={loading}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a new user account</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email"
                />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  minLength={8}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: AppUser["role"]) =>
                      setFormData({ ...formData, role: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: AppUser["status"]) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleAdd} className="w-full">
                Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users available
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user._id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "secondary"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDeleteUser(user._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {!loading && users && users.length ? (
          <div className="flex justify-center items-center gap-2 p-4 border-t">
            {/* Previous Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: Math.max(0, prev.skip - prev.limit),
                }))
              }
              disabled={currentPage === 1}
            >
              &lt;
            </Button>

            {/* Left Ellipsis */}
            {currentPage > 3 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}

            {/* Visible Page Numbers */}
            {Array.from({ length: 3 }, (_, i) => {
              let startPage = currentPage;

              // Handle edges
              if (currentPage <= 2) startPage = 1;
              else if (currentPage >= totalPages - 1)
                startPage = totalPages - 2;
              else startPage = currentPage - 1;

              const pageNum = startPage + i;
              if (pageNum < 1 || pageNum > totalPages) return null;

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      skip: (pageNum - 1) * prev.limit,
                    }))
                  }
                >
                  {pageNum}
                </Button>
              );
            })}

            {/* Right Ellipsis */}
            {currentPage < totalPages - 2 && (
              <span className="px-2 text-muted-foreground">...</span>
            )}

            {/* Next Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  skip: Math.min(
                    (totalPages - 1) * prev.limit,
                    prev.skip + prev.limit
                  ),
                }))
              }
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </div>
        ) : (
          ""
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={"******"}
                disabled={true}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: AppUser["role"]) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: AppUser["status"]) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleEdit} className="w-full">
              Update User
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={confirmDialogOpen}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteUser}
        onCancel={() => setConfirmDialogOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
