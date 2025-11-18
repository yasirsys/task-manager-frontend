import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, Plus } from "lucide-react";
import { User, UserForm } from "@/types/user";

type UserFormModalProps = {
  mode: "create" | "edit";
  triggerText?: string;
  triggerDisabled?: boolean;
  open: boolean;
  onOpenChange: (value: boolean) => void;
  formData: UserForm;
  setFormData: (data: any) => void;
  onSubmit: () => void;
  loading?: boolean;
};

export const UserFormModal = ({
  mode,
  triggerText,
  triggerDisabled,
  open,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  loading,
}: UserFormModalProps) => {
  const [showPassword, setShowPassword] = useState(false);

  const isCreate = mode === "create";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {isCreate && (
        <DialogTrigger asChild>
          <Button disabled={triggerDisabled}>
            <Plus className="mr-2 h-4 w-4" />
            {triggerText || "Add User"}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isCreate ? "Add New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreate ? "Create a new user account" : "Update user details"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          {/* Password (only for create mode) */}
          {isCreate && (
            <div className="space-y-2 relative">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password || ""}
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
          )}

          {/* Role & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: User["role"]) =>
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
                onValueChange={(value: User["status"]) =>
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

          {/* Submit Button */}
          <Button onClick={onSubmit} disabled={loading} className="w-full">
            {loading
              ? isCreate
                ? "Creating..."
                : "Updating…"
              : isCreate
              ? "Create User"
              : "Update User"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
