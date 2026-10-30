import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ticketsApi } from "../api/tickets.api";
import { queryKeys } from "@/lib/query-keys";
import {
  TicketFilterParams,
  CreateTicketDTO,
  UpdateTicketDTO,
  TicketStatus,
  TicketPriority,
} from "@/types/ticket.types";

export const useTickets = (params?: TicketFilterParams) => {
  const queryClient = useQueryClient();

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => ticketsApi.listTickets(params),
  });

  const createTicketMutation = useMutation({
    mutationFn: (data: CreateTicketDTO) => ticketsApi.createTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTicketDTO }) =>
      ticketsApi.updateTicket(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.id) });
    },
  });

  const deleteTicketMutation = useMutation({
    mutationFn: (id: string) => ticketsApi.deleteTicket(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
    },
  });

  const assignTicketMutation = useMutation({
    mutationFn: ({ id, assignedTo }: { id: string; assignedTo: string }) =>
      ticketsApi.assignTicket(id, assignedTo),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.id) });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TicketStatus }) =>
      ticketsApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.id) });
    },
  });

  const updatePriorityMutation = useMutation({
    mutationFn: ({ id, priority }: { id: string; priority: TicketPriority }) =>
      ticketsApi.updatePriority(id, priority),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tickets.detail(variables.id) });
    },
  });

  return {
    tickets: ticketsQuery.data?.items || [],
    pagination: ticketsQuery.data?.pagination,
    isLoading: ticketsQuery.isLoading,
    isFetching: ticketsQuery.isFetching,
    error: ticketsQuery.error,
    refetch: ticketsQuery.refetch,
    createTicket: createTicketMutation.mutateAsync,
    isCreating: createTicketMutation.isPending,
    updateTicket: updateTicketMutation.mutateAsync,
    isUpdating: updateTicketMutation.isPending,
    deleteTicket: deleteTicketMutation.mutateAsync,
    isDeleting: deleteTicketMutation.isPending,
    assignTicket: assignTicketMutation.mutateAsync,
    isAssigning: assignTicketMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    updatePriority: updatePriorityMutation.mutateAsync,
    isUpdatingPriority: updatePriorityMutation.isPending,
  };
};

export const useTicketDetail = (id?: string) => {
  return useQuery({
    queryKey: queryKeys.tickets.detail(id || ""),
    queryFn: () => ticketsApi.getTicketById(id!),
    enabled: !!id,
  });
};

