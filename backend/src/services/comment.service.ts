import { Comment, ICommentDocument } from "../models/comment.model";
import { Ticket } from "../models/ticket.model";
import { UserRole } from "../config/constants";
import { IAuthenticatedUser } from "../types/auth.types";
import {
  CreateCommentInput,
  UpdateCommentInput,
  ListCommentsQuery,
  UpdateCommentReadStatusInput,
} from "../validators/comment.validator";
import { ApiError } from "../utils/ApiError";
import { canUserCommentOnTicket, canUserViewTicket } from "../helpers/ticket.helper";
import { PaginatedResult } from "../types/common.types";

export class CommentService {
  static async createComment(
    ticketId: string,
    input: CreateCommentInput,
    user: IAuthenticatedUser
  ): Promise<ICommentDocument> {
    const ticket = await Ticket.findOne({ _id: ticketId, deletedAt: null });

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    if (!canUserCommentOnTicket(user, ticket)) {
      throw ApiError.forbidden("You are not authorized to post comments on this ticket");
    }

    const comment = await Comment.create({
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

  static async listComments(
    ticketId: string,
    query: ListCommentsQuery,
    user: IAuthenticatedUser
  ): Promise<PaginatedResult<ICommentDocument>> {
    const ticket = await Ticket.findOne({ _id: ticketId, deletedAt: null });

    if (!ticket) {
      throw ApiError.notFound("Ticket not found");
    }

    if (!canUserViewTicket(user, ticket)) {
      throw ApiError.forbidden("You are not authorized to view comments on this ticket");
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
      Comment.countDocuments(filter),
      Comment.find(filter)
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

  static async updateComment(
    commentId: string,
    input: UpdateCommentInput,
    user: IAuthenticatedUser
  ): Promise<ICommentDocument> {
    const comment = await Comment.findOne({ _id: commentId, deletedAt: null });

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    const isAuthor = comment.authorId.toString() === user._id.toString();
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw ApiError.forbidden("You are not authorized to edit this comment");
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

  static async deleteComment(
    commentId: string,
    user: IAuthenticatedUser
  ): Promise<void> {
    const comment = await Comment.findOne({ _id: commentId, deletedAt: null });

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    const isAuthor = comment.authorId.toString() === user._id.toString();
    const isAdmin = user.role === UserRole.ADMIN;

    if (!isAuthor && !isAdmin) {
      throw ApiError.forbidden("You are not authorized to delete this comment");
    }

    comment.deletedAt = new Date();
    await comment.save();
  }

  static async updateReadStatus(
    commentId: string,
    input: UpdateCommentReadStatusInput,
    user: IAuthenticatedUser
  ): Promise<ICommentDocument> {
    const comment = await Comment.findOne({ _id: commentId, deletedAt: null });

    if (!comment) {
      throw ApiError.notFound("Comment not found");
    }

    const ticket = await Ticket.findOne({ _id: comment.ticketId, deletedAt: null });
    if (!ticket || !canUserViewTicket(user, ticket)) {
      throw ApiError.forbidden("You are not authorized to update this comment");
    }

    comment.isRead = input.isRead;
    await comment.save();

    return comment.populate({
      path: "authorId",
      select: "username email role",
    });
  }
}
