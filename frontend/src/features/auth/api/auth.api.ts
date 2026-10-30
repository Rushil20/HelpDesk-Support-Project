import { api } from "@/lib/axios";
import { ApiResponse } from "@/types/api.types";
import { User, LoginResponseData } from "@/types/auth.types";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

export const authApi = {
  login: async (input: LoginInput): Promise<LoginResponseData> => {
    const res = await api.post<ApiResponse<LoginResponseData>>("/auth/login", input);
    return res.data.data;
  },

  register: async (input: RegisterInput): Promise<User> => {
    // Strip confirmPassword before sending to backend
    const { confirmPassword: _, ...payload } = input;
    const res = await api.post<ApiResponse<User>>("/auth/register", payload);
    return res.data.data;
  },

  getMe: async (): Promise<User> => {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
};

