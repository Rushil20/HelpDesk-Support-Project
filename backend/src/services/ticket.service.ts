import mongoose, { Types } from "mongoose";
import { Ticket, ITicketDocument } from "../models/ticket.model";
import { User } from "../models/user.model";
import { UserRole, UserStatus, TicketStatus } from "../config/constants";
import { IAuthenticatedUser } from "../types/auth.types";
import {
  CreateTicketInput,
  UpdateTicketInput,
  AssignTicketInput,
  UpdateTicketStatusInput,
  UpdateTicketPriorityInput,
  ListTicketsQuery,
} from "../validators/ticket.validator";
import { ApiError } from "../utils/ApiError";
import {
  canUserViewTicket,
  canUserModifyTicket,
  canUserAssignTicket,
} from "../helpers/ticket.helper";
import { PaginatedResult } from "../types/common.types";

export class TicketService {
  static async createTicket(
    input: CreateTicketInput,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    let createdByUserId: Types.ObjectId;

    // If an agent or admin is creating ticket, it MUST be on behalf of an employee
    // and must never have the agent or admin's own ID as createdBy
    if (user.role === UserRole.AGENT || user.role === UserRole.ADMIN) {
      if (!input.createdBy) {
        throw ApiError.badRequest(
          "Agents and Admins must specify 'createdBy' with the user ID of the employee for whom the ticket is being created"
        );
      }

      const targetCreator = await User.findById(input.createdBy);
      if (!targetCreator) {
        throw ApiError.notFound("Specified creator user not found");
      }
      if (targetCreator.status !== UserStatus.ACTIVE) {
        throw ApiError.badRequest("Cannot create ticket for an inactive user");
      }
      if (targetCreator.role !== UserRole.EMPLOYEE) {
        throw ApiError.badRequest(
          "Tickets can only be created on behalf of users with the 'employee' role"
        );
      }
      createdByUserId = targetCreator._id;
    } else {
      // Employees always create tickets for themselves
      createdByUserId = user._id;
    }

    const trimmedTitle = input.title.trim();

    // Use a MongoDB transaction to ensure atomicity and prevent duplicate tickets with the same title
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check if an active (non-deleted) ticket with the same title already exists for this user
      const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingTicket = await Ticket.findOne({
        createdBy: createdByUserId,
        title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
        deletedAt: null,
      }).session(session);

      if (existingTicket) {
        throw ApiError.conflict(
          "A ticket with this title already exists for this user. Please choose a different title."
        );
      }

      const [ticket] = await Ticket.create(
        [
          {
            title: trimmedTitle,
            description: input.description,
            priority: input.priority,
            status: TicketStatus.OPEN,
            createdBy: createdByUserId,
            assignedTo: null,
            deletedAt: null,
          },
        ],
        { session }
      );

      if (!ticket) {
        throw ApiError.internal("Failed to create ticket within database transaction");
      }

      await session.commitTransaction();

      return await ticket.populate([
        { path: "createdBy", select: "username email role status" },
        { path: "assignedTo", select: "username email role status" },
      ]);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async listTickets(
    query: ListTicketsQuery,
    user: IAuthenticatedUser
  ): Promise<PaginatedResult<ITicketDocument>> {
    const filter: Record<string, unknown> = {
      deletedAt: null,
    };

    // Role-based visibility
    if (user.role === UserRole.EMPLOYEE) {
      filter.createdBy = user._id;
    } else {
      if (query.createdBy) {
        filter.createdBy = new Types.ObjectId(query.createdBy);
      }
    }

    if (query.assignedTo) {
      filter.assignedTo = new Types.ObjectId(query.assignedTo);
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search.trim(), "i");
      filter.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    const page = query.page;
    const limit = query.limit;
    const skip = (page - 1) * limit;

    const sortOrder = query.sortOrder === "asc" ? 1 : -1;
    const sortField = query.sortBy || "createdAt";

    const [total, tickets] = await Promise.all([
      Ticket.countDocuments(filter),
      Ticket.find(filter)
        .populate("createdBy", "username email role status")
        .populate("assignedTo", "username email role status")
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  static async getTicketById(
    id: string,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    const ticket = await Ticket.findOne({ _id: id, deletedAt: null })
      .populate("createdBy", "username email role status")
      .populate("assignedTo", "username email role status");

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    if (!canUserViewTicket(user, ticket)) {
      throw ApiError.forbidden("You are not authorized to access this ticket");
    }

    return ticket;
  }

  static async updateTicket(
    id: string,
    input: UpdateTicketInput,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    const ticket = await Ticket.findOne({ _id: id, deletedAt: null });

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    if (!canUserModifyTicket(user, ticket)) {
      throw ApiError.forbidden(
        "You are not authorized to update this ticket or the ticket is no longer open"
      );
    }

    if (input.title !== undefined) {
      ticket.title = input.title;
    }

    if (input.description !== undefined) {
      ticket.description = input.description;
    }

    await ticket.save();

    return ticket.populate([
      { path: "createdBy", select: "username email role status" },
      { path: "assignedTo", select: "username email role status" },
    ]);
  }

  static async deleteTicket(
    id: string,
    user: IAuthenticatedUser
  ): Promise<void> {
    const ticket = await Ticket.findOne({ _id: id, deletedAt: null });

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    // Role check: Only admin/agent or creator if open
    if (!canUserModifyTicket(user, ticket) && user.role === UserRole.EMPLOYEE) {
      throw ApiError.forbidden(
        "You can only delete your own tickets while they remain in 'open' status"
      );
    }

    // Soft delete
    ticket.deletedAt = new Date();
    await ticket.save();
  }

  static async assignTicket(
    id: string,
    input: AssignTicketInput,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    if (!canUserAssignTicket(user)) {
      throw ApiError.forbidden("Only agents and administrators can assign tickets");
    }

    const ticket = await Ticket.findOne({ _id: id, deletedAt: null });
    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    const targetAssignee = await User.findById(input.assignedTo);
    if (!targetAssignee) {
      throw ApiError.notFound("Assigned agent not found");
    }

    if (targetAssignee.status !== UserStatus.ACTIVE) {
      throw ApiError.badRequest("Cannot assign ticket to an inactive agent");
    }

    if (
      targetAssignee.role !== UserRole.AGENT &&
      targetAssignee.role !== UserRole.ADMIN
    ) {
      throw ApiError.badRequest(
        "Tickets can only be assigned to users with the 'agent' or 'admin' role"
      );
    }

    ticket.assignedTo = targetAssignee._id;
    await ticket.save();

    return ticket.populate([
      { path: "createdBy", select: "username email role status" },
      { path: "assignedTo", select: "username email role status" },
    ]);
  }

  static async updateStatus(
    id: string,
    input: UpdateTicketStatusInput,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    const ticket = await Ticket.findOne({ _id: id, deletedAt: null });
    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    // Employees can only update their own ticket's status (e.g. closing or resolving it)
    if (user.role === UserRole.EMPLOYEE) {
      if (ticket.createdBy.toString() !== user._id.toString()) {
        throw ApiError.forbidden("You can only modify status on your own tickets");
      }
      if (input.status !== TicketStatus.CLOSED && input.status !== TicketStatus.RESOLVED) {
        throw ApiError.forbidden(
          "Employees can only mark their own tickets as 'resolved' or 'closed'"
        );
      }
    }

    ticket.status = input.status;
    await ticket.save();

    return ticket.populate([
      { path: "createdBy", select: "username email role status" },
      { path: "assignedTo", select: "username email role status" },
    ]);
  }

  static async updatePriority(
    id: string,
    input: UpdateTicketPriorityInput,
    user: IAuthenticatedUser
  ): Promise<ITicketDocument> {
    if (user.role !== UserRole.AGENT && user.role !== UserRole.ADMIN) {
      throw ApiError.forbidden("Only agents and administrators can modify ticket priority");
    }

    const ticket = await Ticket.findOne({ _id: id, deletedAt: null });
    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    ticket.priority = input.priority;
    await ticket.save();

    return ticket.populate([
      { path: "createdBy", select: "username email role status" },
      { path: "assignedTo", select: "username email role status" },
    ]);
  }
}
