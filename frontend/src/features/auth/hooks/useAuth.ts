import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useAuthStore } from "@/stores/auth.store";
import { queryKeys } from "@/lib/query-keys";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuth, setUser, logout, user, isAuthenticated, isLoading } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginInput) => authApi.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.accessToken);
      queryClient.setQueryData(queryKeys.auth.me, data.user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterInput) => authApi.register(data),
  });

  const currentUserQuery = useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.getMe,
    enabled: !!localStorage.getItem("auth_token"),
    retry: false,
  });

  return {
    user,
    isAuthenticated,
    isLoading: isLoading || currentUserQuery.isLoading,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout,
    setUser,
  };
};

