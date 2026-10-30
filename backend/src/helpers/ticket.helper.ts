import { IAuthenticatedUser } from "../types/auth.types";
import { ITicketDocument } from "../models/ticket.model";
import { UserRole, TicketStatus } from "../config/constants";

export const canUserViewTicket = (
  user: IAuthenticatedUser,
  ticket: ITicketDocument
): boolean => {
  if (user.role === UserRole.ADMIN || user.role === UserRole.AGENT) {
    return true;
  }
  // Employee can only view their own ticket
  return ticket.createdBy._id.toString() === user._id.toString();
};

export const canUserModifyTicket = (
  user: IAuthenticatedUser,
  ticket: ITicketDocument
): boolean => {
  if (user.role === UserRole.ADMIN || user.role === UserRole.AGENT) {
    return true;
  }
  // Employee can only modify their own open ticket
  return (
    ticket.createdBy.toString() === user._id.toString() &&
    ticket.status === TicketStatus.OPEN
  );
};

export const canUserAssignTicket = (user: IAuthenticatedUser): boolean => {
  return user.role === UserRole.ADMIN || user.role === UserRole.AGENT;
};

export const canUserCommentOnTicket = (
  user: IAuthenticatedUser,
  ticket: ITicketDocument
): boolean => {
  if (user.role === UserRole.ADMIN || user.role === UserRole.AGENT) {
    return true;
  }
  return ticket.createdBy.toString() === user._id.toString();
};

