import { UserRole, UserStatus } from "@/constants/enum";
import axiosClient from "./axiosClient";

export const userApi = {
  getAll: () => axiosClient.get("/users"),
  getById: (id: string) => axiosClient.get(`/users/${id}`),
  create: (data: {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    status: UserStatus;
  }) => axiosClient.post("/users", data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      email: string;
      password: string;
      role: UserRole;
      status: UserStatus;
    }>
  ) => axiosClient.patch(`/users/${id}`, data),
  delete: (id: string) => axiosClient.delete(`/users/${id}`),
  getAllPaginated: (skip?: number, limit?: number) => {
    const params: Record<string, any> = {};
    if (skip) params.skip = skip;
    if (limit) params.limit = limit;

    return axiosClient.get("/users/paginated", { params });
  },
};
