import { User } from "./auth.types";

export enum TicketPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum TicketStatus {
  OPEN = "open",
  IN_PROGRESS = "in_progress",
  RESOLVED = "resolved",
  CLOSED = "closed",
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: User;
  assignedTo?: User | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketDTO {
  title: string;
  description: string;
  priority?: TicketPriority;
  createdBy?: string;
}

export interface UpdateTicketDTO {
  title?: string;
  description?: string;
}

export interface TicketFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assignedTo?: string;
  createdBy?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

