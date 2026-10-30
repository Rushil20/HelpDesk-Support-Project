import { TicketFilterParams } from "@/types/ticket.types";

export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  tickets: {
    all: ["tickets"] as const,
    list: (params?: TicketFilterParams) => ["tickets", "list", params] as const,
    detail: (id: string) => ["tickets", "detail", id] as const,
  },
  comments: {
    byTicket: (ticketId: string, page = 1) => ["comments", "ticket", ticketId, page] as const,
  },
  users: {
    all: ["users"] as const,
    list: (params?: Record<string, unknown>) => ["users", "list", params] as const,
    detail: (id: string) => ["users", "detail", id] as const,
    eligibleAgents: ["users", "eligible-agents"] as const,
    eligibleEmployees: ["users", "eligible-employees"] as const,
  },
  dashboard: {
    stats: ["dashboard", "stats"] as const,
  },
};

