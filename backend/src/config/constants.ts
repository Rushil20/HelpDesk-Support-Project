export enum UserRole {
  EMPLOYEE = "employee",
  AGENT = "agent",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
}

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

export const USER_ROLES = Object.values(UserRole) as [UserRole, ...UserRole[]];
export const USER_STATUSES = Object.values(UserStatus) as [UserStatus, ...UserStatus[]];
export const TICKET_PRIORITIES = Object.values(TicketPriority) as [TicketPriority, ...TicketPriority[]];
export const TICKET_STATUSES = Object.values(TicketStatus) as [TicketStatus, ...TicketStatus[]];

