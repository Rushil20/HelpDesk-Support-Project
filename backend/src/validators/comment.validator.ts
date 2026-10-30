import { z } from "zod";
import { objectIdSchema } from "./user.validator";

export const attachmentMetadataSchema = z.object({
  fileName: z.string().min(1, "fileName is required"),
  originalName: z.string().min(1, "originalName is required"),
  fileUrl: z.string().min(1, "fileUrl is required"),
  mimeType: z.string().min(1, "mimeType is required"),
  size: z.number().nonnegative("size must be non-negative"),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const ticketIdInCommentParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createCommentSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      message: z.string().optional().default(""),
      attachments: z.array(attachmentMetadataSchema).optional().default([]),
    })
    .refine(
      (data) => {
        const hasText = data.message && data.message.trim().length > 0;
        const hasAttachments = data.attachments && data.attachments.length > 0;
        return hasText || hasAttachments;
      },
      {
        message: "A comment message must contain either text, attachments, or both",
      }
    ),
});

export const updateCommentSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      message: z.string().optional(),
      attachments: z.array(attachmentMetadataSchema).optional(),
    })
    .refine(
      (data) => {
        if (data.message !== undefined && data.attachments !== undefined) {
          return data.message.trim().length > 0 || data.attachments.length > 0;
        }
        if (data.message !== undefined) {
          return data.message.trim().length > 0;
        }
        if (data.attachments !== undefined) {
          return data.attachments.length > 0;
        }
        return false;
      },
      {
        message: "Updated comment must not be empty",
      }
    ),
});

export const updateCommentReadStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    isRead: z.boolean(),
  }),
});

export const listCommentsQuerySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(30),
    sortBy: z.enum(["createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>["body"];
export type UpdateCommentInput = z.infer<typeof updateCommentSchema>["body"];
export type UpdateCommentReadStatusInput = z.infer<typeof updateCommentReadStatusSchema>["body"];
export type ListCommentsQuery = z.infer<typeof listCommentsQuerySchema>["query"];

