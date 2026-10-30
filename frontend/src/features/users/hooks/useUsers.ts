import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { usersApi, ListUsersParams, CreateUserDTO, UpdateUserDTO } from "../api/users.api";
import { queryKeys } from "@/lib/query-keys";
import { UserRole } from "@/types/auth.types";

export const useUsers = (params?: ListUsersParams) => {
  const queryClient = useQueryClient();

  const usersQuery = useQuery({
    queryKey: queryKeys.users.list(params as Record<string, unknown>),
    queryFn: () => usersApi.listUsers(params),
  });

  const createUserMutation = useMutation({
    mutationFn: (data: CreateUserDTO) => usersApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDTO }) =>
      usersApi.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(variables.id) });
    },
  });

  const deactivateUserMutation = useMutation({
    mutationFn: (id: string) => usersApi.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  const changeUserRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole.EMPLOYEE | UserRole.AGENT }) =>
      usersApi.changeUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });

  return {
    users: usersQuery.data?.items || [],
    pagination: usersQuery.data?.pagination,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error: usersQuery.error,
    refetch: usersQuery.refetch,
    createUser: createUserMutation.mutateAsync,
    isCreating: createUserMutation.isPending,
    updateUser: updateUserMutation.mutateAsync,
    isUpdating: updateUserMutation.isPending,
    deactivateUser: deactivateUserMutation.mutateAsync,
    isDeactivating: deactivateUserMutation.isPending,
    changeUserRole: changeUserRoleMutation.mutateAsync,
    isChangingRole: changeUserRoleMutation.isPending,
  };
};

export const useUserDetail = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.users.detail(id || ""),
    queryFn: () => usersApi.getUserById(id!),
    enabled: !!id,
  });
};

