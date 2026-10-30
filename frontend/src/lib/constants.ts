import { TicketPriority, TicketStatus } from "@/types/ticket.types";
import { UserRole, UserStatus } from "@/types/auth.types";

export const APP_NAME = "Helpdesk Lite";

export const ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.EMPLOYEE]: "Employee",
  [UserRole.AGENT]: "Support Agent",
  [UserRole.ADMIN]: "Administrator",
};

export const STATUS_CONFIG: Record<
  TicketStatus,
  { label: string; color: "info" | "warning" | "success" | "default" }
> = {
  [TicketStatus.OPEN]: { label: "Open", color: "info" },
  [TicketStatus.IN_PROGRESS]: { label: "In Progress", color: "warning" },
  [TicketStatus.RESOLVED]: { label: "Resolved", color: "success" },
  [TicketStatus.CLOSED]: { label: "Closed", color: "default" },
};

export const PRIORITY_CONFIG: Record<
  TicketPriority,
  { label: string; color: "default" | "primary" | "error" }
> = {
  [TicketPriority.LOW]: { label: "Low", color: "default" },
  [TicketPriority.MEDIUM]: { label: "Medium", color: "primary" },
  [TicketPriority.HIGH]: { label: "High", color: "error" },
};

export const USER_STATUS_CONFIG: Record<
  UserStatus,
  { label: string; color: "success" | "error" }
> = {
  [UserStatus.ACTIVE]: { label: "Active", color: "success" },
  [UserStatus.INACTIVE]: { label: "Inactive", color: "error" },
};

export const DEFAULT_PAGE_LIMIT = 10;

