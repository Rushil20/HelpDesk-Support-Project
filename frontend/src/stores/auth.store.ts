import { create } from "zustand";
import { User, UserRole } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  setUser: (user: User | null) => void;
  updateUser: (partial: Partial<User>) => void;
  hasRole: (role: UserRole) => boolean;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const initialToken = localStorage.getItem("auth_token");

  // Listen to session expired events dispatched by axios interceptor
  if (typeof window !== "undefined") {
    window.addEventListener("auth:session-expired", () => {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    });
  }

  return {
    user: null,
    token: initialToken,
    isAuthenticated: !!initialToken,
    isLoading: !!initialToken, // Will verify on app startup

    setAuth: (user: User, token: string) => {
      localStorage.setItem("auth_token", token);
      set({ user, token, isAuthenticated: true, isLoading: false });
    },

    setUser: (user: User | null) => {
      set({ user, isAuthenticated: !!user, isLoading: false });
    },

    updateUser: (partial: Partial<User>) => {
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, ...partial } });
      }
    },

    hasRole: (role: UserRole) => {
      return get().user?.role === role;
    },

    setLoading: (isLoading: boolean) => {
      set({ isLoading });
    },

    logout: () => {
      localStorage.removeItem("auth_token");
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    },
  };
});
