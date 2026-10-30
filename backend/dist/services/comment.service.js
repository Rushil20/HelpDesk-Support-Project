"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentService = void 0;
const comment_model_1 = require("../models/comment.model");
const ticket_model_1 = require("../models/ticket.model");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const ticket_helper_1 = require("../helpers/ticket.helper");
class CommentService {
    static async createComment(ticketId, input, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: ticketId, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        if (!(0, ticket_helper_1.canUserCommentOnTicket)(user, ticket)) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to post comments on this ticket");
        }
        const comment = await comment_model_1.Comment.create({
            ticketId: ticket._id,
            authorId: user._id,
            message: input.message?.trim() || "",
            attachments: input.attachments || [],
            isRead: false,
            deletedAt: null,
        });
        return comment.populate({
            path: "authorId",
            select: "username email role",
        });
    }
    static async listComments(ticketId, query, user) {
        const ticket = await ticket_model_1.Ticket.findOne({ _id: ticketId, deletedAt: null });
        if (!ticket) {
            throw ApiError_1.ApiError.notFound("Ticket not found");
        }
        if (!(0, ticket_helper_1.canUserViewTicket)(user, ticket)) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to view comments on this ticket");
        }
        const filter = {
            ticketId: ticket._id,
            deletedAt: null,
        };
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;
        const sortOrder = query.sortOrder === "desc" ? -1 : 1;
        const [total, comments] = await Promise.all([
            comment_model_1.Comment.countDocuments(filter),
            comment_model_1.Comment.find(filter)
                .populate("authorId", "username email role")
                .sort({ createdAt: sortOrder, _id: sortOrder })
                .skip(skip)
                .limit(limit),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            items: comments,
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
    static async updateComment(commentId, input, user) {
        const comment = await comment_model_1.Comment.findOne({ _id: commentId, deletedAt: null });
        if (!comment) {
            throw ApiError_1.ApiError.notFound("Comment not found");
        }
        const isAuthor = comment.authorId.toString() === user._id.toString();
        const isAdmin = user.role === constants_1.UserRole.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to edit this comment");
        }
        if (input.message !== undefined) {
            comment.message = input.message.trim();
        }
        if (input.attachments !== undefined) {
            comment.attachments = input.attachments;
        }
        await comment.save();
        return comment.populate({
            path: "authorId",
            select: "username email role",
        });
    }
    static async deleteComment(commentId, user) {
        const comment = await comment_model_1.Comment.findOne({ _id: commentId, deletedAt: null });
        if (!comment) {
            throw ApiError_1.ApiError.notFound("Comment not found");
        }
        const isAuthor = comment.authorId.toString() === user._id.toString();
        const isAdmin = user.role === constants_1.UserRole.ADMIN;
        if (!isAuthor && !isAdmin) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to delete this comment");
        }
        comment.deletedAt = new Date();
        await comment.save();
    }
    static async updateReadStatus(commentId, input, user) {
        const comment = await comment_model_1.Comment.findOne({ _id: commentId, deletedAt: null });
        if (!comment) {
            throw ApiError_1.ApiError.notFound("Comment not found");
        }
        const ticket = await ticket_model_1.Ticket.findOne({ _id: comment.ticketId, deletedAt: null });
        if (!ticket || !(0, ticket_helper_1.canUserViewTicket)(user, ticket)) {
            throw ApiError_1.ApiError.forbidden("You are not authorized to update this comment");
        }
        comment.isRead = input.isRead;
        await comment.save();
        return comment.populate({
            path: "authorId",
            select: "username email role",
        });
    }
}
exports.CommentService = CommentService;
