import { Request, Response } from "express";
import { CommentService } from "../services/comment.service";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { ListCommentsQuery } from "../validators/comment.validator";

export class CommentController {
  static createComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await CommentService.createComment(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.created(res, "Comment added successfully", comment);
  });

  static listComments = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as ListCommentsQuery;
    const result = await CommentService.listComments(
      req.params.id as string,
      query,
      req.user!
    );
    ApiResponse.success(res, "Comments retrieved successfully", result);
  });

  static updateComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await CommentService.updateComment(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Comment updated successfully", comment);
  });

  static deleteComment = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await CommentService.deleteComment(req.params.id as string, req.user!);
    ApiResponse.success(res, "Comment deleted successfully");
  });

  static updateReadStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const comment = await CommentService.updateReadStatus(
      req.params.id as string,
      req.body,
      req.user!
    );
    ApiResponse.success(res, "Comment read status updated successfully", comment);
  });
}

