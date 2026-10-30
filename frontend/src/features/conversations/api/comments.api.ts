import { api } from "@/lib/axios";
import { ApiResponse, PaginatedResult } from "@/types/api.types";
import { Comment, CreateCommentDTO, UpdateCommentDTO } from "@/types/comment.types";

export const commentsApi = {
  listComments: async (ticketId: string, page = 1, limit = 50): Promise<PaginatedResult<Comment>> => {
    const res = await api.get<ApiResponse<PaginatedResult<Comment>>>(`/tickets/${ticketId}/comments`, {
      params: { page, limit, sortBy: "createdAt", sortOrder: "asc" },
    });
    return res.data.data;
  },

  createComment: async (ticketId: string, input: CreateCommentDTO): Promise<Comment> => {
    const res = await api.post<ApiResponse<Comment>>(`/tickets/${ticketId}/comments`, input);
    return res.data.data;
  },

  updateComment: async (commentId: string, input: UpdateCommentDTO): Promise<Comment> => {
    const res = await api.patch<ApiResponse<Comment>>(`/comments/${commentId}`, input);
    return res.data.data;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/comments/${commentId}`);
  },

  updateReadStatus: async (commentId: string, isRead: boolean): Promise<Comment> => {
    const res = await api.patch<ApiResponse<Comment>>(`/comments/${commentId}/read`, {
      isRead,
    });
    return res.data.data;
  },
};

