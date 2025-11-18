import { UserRole, UserStatus } from "../constants/enum";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UserForm {
  name: string;
  email: string;
  password?: string; // optional because password is only used in create mode
  role: User["role"];
  status: User["status"];
}
