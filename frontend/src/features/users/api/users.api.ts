import { api } from "@/lib/axios";
import { ApiResponse, PaginatedResult } from "@/types/api.types";
import { User, UserRole } from "@/types/auth.types";

export interface ListUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface CreateUserDTO {
  username: string;
  email: string;
  password: string;
  role: UserRole.EMPLOYEE | UserRole.AGENT;
  status?: "active" | "inactive";
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  password?: string;
  status?: "active" | "inactive";
}

export const usersApi = {
  listUsers: async (params?: ListUsersParams): Promise<PaginatedResult<User>> => {
    const res = await api.get<ApiResponse<PaginatedResult<User>>>("/users", {
      params,
    });
    return res.data.data;
  },

  getUserById: async (id: string): Promise<User> => {
    const res = await api.get<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  createUser: async (input: CreateUserDTO): Promise<User> => {
    const res = await api.post<ApiResponse<User>>("/users", input);
    return res.data.data;
  },

  updateUser: async (id: string, input: UpdateUserDTO): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}`, input);
    return res.data.data;
  },

  deactivateUser: async (id: string): Promise<User> => {
    const res = await api.delete<ApiResponse<User>>(`/users/${id}`);
    return res.data.data;
  },

  changeUserRole: async (id: string, role: UserRole.EMPLOYEE | UserRole.AGENT): Promise<User> => {
    const res = await api.patch<ApiResponse<User>>(`/users/${id}/role`, { role });
    return res.data.data;
  },
};

