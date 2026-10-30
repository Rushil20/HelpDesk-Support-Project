"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCommentsQuerySchema = exports.updateCommentReadStatusSchema = exports.updateCommentSchema = exports.createCommentSchema = exports.ticketIdInCommentParamSchema = exports.commentIdParamSchema = exports.attachmentMetadataSchema = void 0;
const zod_1 = require("zod");
const user_validator_1 = require("./user.validator");
exports.attachmentMetadataSchema = zod_1.z.object({
    fileName: zod_1.z.string().min(1, "fileName is required"),
    originalName: zod_1.z.string().min(1, "originalName is required"),
    fileUrl: zod_1.z.string().min(1, "fileUrl is required"),
    mimeType: zod_1.z.string().min(1, "mimeType is required"),
    size: zod_1.z.number().nonnegative("size must be non-negative"),
});
exports.commentIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
});
exports.ticketIdInCommentParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
});
exports.createCommentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z
        .object({
        message: zod_1.z.string().optional().default(""),
        attachments: zod_1.z.array(exports.attachmentMetadataSchema).optional().default([]),
    })
        .refine((data) => {
        const hasText = data.message && data.message.trim().length > 0;
        const hasAttachments = data.attachments && data.attachments.length > 0;
        return hasText || hasAttachments;
    }, {
        message: "A comment message must contain either text, attachments, or both",
    }),
});
exports.updateCommentSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z
        .object({
        message: zod_1.z.string().optional(),
        attachments: zod_1.z.array(exports.attachmentMetadataSchema).optional(),
    })
        .refine((data) => {
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
    }, {
        message: "Updated comment must not be empty",
    }),
});
exports.updateCommentReadStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z.object({
        isRead: zod_1.z.boolean(),
    }),
});
exports.listCommentsQuerySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(30),
        sortBy: zod_1.z.enum(["createdAt", "updatedAt"]).default("createdAt"),
        sortOrder: zod_1.z.enum(["asc", "desc"]).default("asc"),
    }),
});
