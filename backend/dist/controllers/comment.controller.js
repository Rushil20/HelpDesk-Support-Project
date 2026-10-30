"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const comment_service_1 = require("../services/comment.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
class CommentController {
    static createComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const comment = await comment_service_1.CommentService.createComment(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.created(res, "Comment added successfully", comment);
    });
    static listComments = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const result = await comment_service_1.CommentService.listComments(req.params.id, query, req.user);
        ApiResponse_1.ApiResponse.success(res, "Comments retrieved successfully", result);
    });
    static updateComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const comment = await comment_service_1.CommentService.updateComment(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Comment updated successfully", comment);
    });
    static deleteComment = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        await comment_service_1.CommentService.deleteComment(req.params.id, req.user);
        ApiResponse_1.ApiResponse.success(res, "Comment deleted successfully");
    });
    static updateReadStatus = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const comment = await comment_service_1.CommentService.updateReadStatus(req.params.id, req.body, req.user);
        ApiResponse_1.ApiResponse.success(res, "Comment read status updated successfully", comment);
    });
}
exports.CommentController = CommentController;
