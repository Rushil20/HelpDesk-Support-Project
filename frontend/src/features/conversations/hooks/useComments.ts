import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { commentsApi } from "../api/comments.api";
import { queryKeys } from "@/lib/query-keys";
import { CreateCommentDTO, UpdateCommentDTO } from "@/types/comment.types";

export const useComments = (ticketId: string, page = 1) => {
  const queryClient = useQueryClient();

  const commentsQuery = useQuery({
    queryKey: queryKeys.comments.byTicket(ticketId, page),
    queryFn: () => commentsApi.listComments(ticketId, page),
    enabled: !!ticketId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (data: CreateCommentDTO) => commentsApi.createComment(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "ticket", ticketId],
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      });
    },
  });

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, data }: { commentId: string; data: UpdateCommentDTO }) =>
      commentsApi.updateComment(commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "ticket", ticketId],
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentsApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "ticket", ticketId],
      });
    },
  });

  const updateReadStatusMutation = useMutation({
    mutationFn: ({ commentId, isRead }: { commentId: string; isRead: boolean }) =>
      commentsApi.updateReadStatus(commentId, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", "ticket", ticketId],
      });
    },
  });

  return {
    comments: commentsQuery.data?.items || [],
    pagination: commentsQuery.data?.pagination,
    isLoading: commentsQuery.isLoading,
    isFetching: commentsQuery.isFetching,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,
    createComment: createCommentMutation.mutateAsync,
    isCreating: createCommentMutation.isPending,
    updateComment: updateCommentMutation.mutateAsync,
    isUpdating: updateCommentMutation.isPending,
    deleteComment: deleteCommentMutation.mutateAsync,
    isDeleting: deleteCommentMutation.isPending,
    updateReadStatus: updateReadStatusMutation.mutateAsync,
  };
};

