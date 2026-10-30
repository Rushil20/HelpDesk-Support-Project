import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiErrorResponse } from "@/types/api.types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Request interceptor to attach Bearer token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("auth_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401s and format error messages
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      // Clear token if unauthorized / token expired
      const isAuthRoute = window.location.pathname.startsWith("/login") || window.location.pathname.startsWith("/register");
      if (!isAuthRoute) {
        localStorage.removeItem("auth_token");
        window.dispatchEvent(new Event("auth:session-expired"));
      }
    }
    return Promise.reject(error);
  }
);

export const getApiErrorMessage = (error: unknown, fallback = "An unexpected error occurred"): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    if (data?.message) {
      if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
        const fieldDetails = data.errors
          .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
          .join(", ");
        return `${data.message} (${fieldDetails})`;
      }
      return data.message;
    }
    if (error.message) {
      return error.message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

