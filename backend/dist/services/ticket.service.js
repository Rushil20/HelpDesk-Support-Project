"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TicketService = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const ticket_model_1 = require("../models/ticket.model");
const user_model_1 = require("../models/user.model");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const ticket_helper_1 = require("../helpers/ticket.helper");
class TicketService {
    static async createTicket(input, user) {
        let createdByUserId = user._id;
        // If an agent or admin is creating ticket on behalf of an employee
        if (input.createdBy) {
            if (user.role === constants_1.UserRole.EMPLOYEE) {
                // Employees are strictly forbidden from specifying another createdBy
                createdByUserId = user._id;
            }
            else {
                const targetCreator = await user_model_1.User.findById(input.createdBy);
                if (!targetCreator) {
                    throw ApiError_1.ApiError.notFound("Specified creator user not found");
                }
                if (targetCreator.status !== constants_1.UserStatus.ACTIVE) {
                    throw ApiError_1.ApiError.badRequest("Cannot create ticket for an inactive user");
                }
                if (targetCreator.role !== constants_1.UserRole.EMPLOYEE) {
                    throw ApiError_1.ApiError.badRequest("Tickets can only be created on behalf of users with the 'employee' role");
                }
                createdByUserId = targetCreator._id;
            }
        }
        const trimmedTitle = input.title.trim();
        // Use a MongoDB transaction to ensure atomicity and prevent duplicate tickets with the same title
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            // Check if an active (non-deleted) ticket with the same title already exists for this user
            const escapedTitle = trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const existingTicket = await ticket_model_1.Ticket.findOne({
                createdBy: createdByUserId,
                title: { $regex: new RegExp(`^${escapedTitle}$`, "i") },
                deletedAt: null,
            }).session(session);
            if (existingTicket) {
                throw ApiError_1.ApiError.conflict("A ticket with this title already exists for this user. Please choose a different title.");
            }
            const [ticket] = await ticket_model_1.Ticket.create([
                {
                    title: trimmedTitle,
                    description: input.description,
                    priority: input.priority,
                    status: constants_1.TicketStatus.OPEN,
                    createdBy: createdByUserId,
                    assignedTo: null,
                    deletedAt: null,
                },
            ], { session });
            if (!ticket) {
                throw ApiError_1.ApiError.internal("Failed to create ticket within database transaction");
            }
            await session.commitTransaction();
            return await ticket.populate([
                { path: "createdBy", select: "username email role status" },
                { path: "assignedTo", select: "username email role status" },
            ]);
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            await session.endSession();
        }
    }
    static async listTickets(query, user) {
        const filter = {
            deletedAt: null,
        };
        // Role-based visibility
        if (user.role === constants_1.UserRole.EMPLOYEE) {
            filter.createdBy = user._id;
        }
        else {
            if (query.createdBy) {
                filter.createdBy = new mongoose_1.Types.ObjectId(query.createdBy);
            }
        }
        if (query.assignedTo) {
            filter.assignedTo = new mongoose_1.Types.ObjectId(query.assignedTo);
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
            ticket_model_1.Ticket.countDocuments(filter),
            ticket_model_1.Ticket.find(filter)
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
    static async getTicketById(id, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null })
            .populate("createdBy", "username email role status")
            .populate("assignedTo", "username email role status");
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        if (!(0, ticket_helper_1.canUserViewTicket)(user, ticket)) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to access this ticket");
        }
        return ticket;
    }
    static async updateTicket(id, input, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        if (!(0, ticket_helper_1.canUserModifyTicket)(user, ticket)) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to update this ticket or the ticket is no longer open");
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
    static async deleteTicket(id, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        // Role check: Only admin/agent or creator if open
        if (!(0, ticket_helper_1.canUserModifyTicket)(user, ticket) && user.role === constants_1.UserRole.EMPLOYEE) {
            throw ApiError_1.ApiError.forbidden("You can only delete your own tickets while they remain in 'open' status");
        }
        // Soft delete
        ticket.deletedAt = new Date();
        await ticket.save();
    }
    static async assignTicket(id, input, user) {
        if (!(0, ticket_helper_1.canUserAssignTicket)(user)) {
            throw ApiError_1.ApiError.forbidden("Only agents and administrators can assign tickets");
        }
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        const targetAssignee = await user_model_1.User.findById(input.assignedTo);
        if (!targetAssignee) {
            throw ApiError_1.ApiError.notFound("Assigned agent not found");
        }
        if (targetAssignee.status !== constants_1.UserStatus.ACTIVE) {
            throw ApiError_1.ApiError.badRequest("Cannot assign ticket to an inactive agent");
        }
        if (targetAssignee.role !== constants_1.UserRole.AGENT &&
            targetAssignee.role !== constants_1.UserRole.ADMIN) {
            throw ApiError_1.ApiError.badRequest("Tickets can only be assigned to users with the 'agent' or 'admin' role");
        }
        ticket.assignedTo = targetAssignee._id;
        await ticket.save();
        return ticket.populate([
            { path: "createdBy", select: "username email role status" },
            { path: "assignedTo", select: "username email role status" },
        ]);
    }
    static async updateStatus(id, input, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        // Employees can only update their own ticket's status (e.g. closing or resolving it)
        if (user.role === constants_1.UserRole.EMPLOYEE) {
            if (ticket.createdBy.toString() !== user._id.toString()) {
                throw ApiError_1.ApiError.forbidden("You can only modify status on your own tickets");
            }
            if (input.status !== constants_1.TicketStatus.CLOSED && input.status !== constants_1.TicketStatus.RESOLVED) {
                throw ApiError_1.ApiError.forbidden("Employees can only mark their own tickets as 'resolved' or 'closed'");
            }
        }
        ticket.status = input.status;
        await ticket.save();
        return ticket.populate([
            { path: "createdBy", select: "username email role status" },
            { path: "assignedTo", select: "username email role status" },
        ]);
    }
    static async updatePriority(id, input, user) {
        if (user.role !== constants_1.UserRole.AGENT && user.role !== constants_1.UserRole.ADMIN) {
            throw ApiError_1.ApiError.forbidden("Only agents and administrators can modify ticket priority");
        }
        const ticket = await ticket_model_1.Ticket.findOne({ _id: id, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        ticket.priority = input.priority;
        await ticket.save();
        return ticket.populate([
            { path: "createdBy", select: "username email role status" },
            { path: "assignedTo", select: "username email role status" },
        ]);
    }
}
exports.TicketService = TicketService;
