import { UserRole, UserStatus, TicketPriority, TicketStatus } from "../config/constants";

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface IAttachment {
  _id?: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  uploadedAt?: Date;
}

export { UserRole, UserStatus, TicketPriority, TicketStatus };

