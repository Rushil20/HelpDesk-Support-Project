import { api } from "@/lib/axios";
import { ApiResponse, PaginatedResult } from "@/types/api.types";
import {
  Ticket,
  TicketFilterParams,
  CreateTicketDTO,
  UpdateTicketDTO,
  TicketStatus,
  TicketPriority,
} from "@/types/ticket.types";

export const ticketsApi = {
  listTickets: async (params?: TicketFilterParams): Promise<PaginatedResult<Ticket>> => {
    const res = await api.get<ApiResponse<PaginatedResult<Ticket>>>("/tickets", {
      params,
    });
    return res.data.data;
  },

  getTicketById: async (id: string): Promise<Ticket> => {
    const res = await api.get<ApiResponse<Ticket>>(`/tickets/${id}`);
    return res.data.data;
  },

  createTicket: async (input: CreateTicketDTO): Promise<Ticket> => {
    const res = await api.post<ApiResponse<Ticket>>("/tickets", input);
    return res.data.data;
  },

  updateTicket: async (id: string, input: UpdateTicketDTO): Promise<Ticket> => {
    const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}`, input);
    return res.data.data;
  },

  deleteTicket: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/tickets/${id}`);
  },

  assignTicket: async (id: string, assignedTo: string): Promise<Ticket> => {
    const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/assign`, {
      assignedTo,
    });
    return res.data.data;
  },

  updateStatus: async (id: string, status: TicketStatus): Promise<Ticket> => {
    const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/status`, {
      status,
    });
    return res.data.data;
  },

  updatePriority: async (id: string, priority: TicketPriority): Promise<Ticket> => {
    const res = await api.patch<ApiResponse<Ticket>>(`/tickets/${id}/priority`, {
      priority,
    });
    return res.data.data;
  },
};

