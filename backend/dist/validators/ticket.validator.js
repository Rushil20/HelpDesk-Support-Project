"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listTicketsQuerySchema = exports.updateTicketPrioritySchema = exports.updateTicketStatusSchema = exports.assignTicketSchema = exports.updateTicketSchema = exports.createTicketSchema = exports.ticketIdParamSchema = void 0;
const zod_1 = require("zod");
const constants_1 = require("../config/constants");
const user_validator_1 = require("./user.validator");
exports.ticketIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
});
exports.createTicketSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z
            .string()
            .min(5, "Title must be between 5 and 120 characters")
            .max(120, "Title must be between 5 and 120 characters"),
        description: zod_1.z.string().min(1, "Description is required"),
        priority: zod_1.z.nativeEnum(constants_1.TicketPriority).default(constants_1.TicketPriority.MEDIUM),
        createdBy: user_validator_1.objectIdSchema.optional(),
    }),
});
exports.updateTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z
        .object({
        title: zod_1.z
            .string()
            .min(5, "Title must be between 5 and 120 characters")
            .max(120, "Title must be between 5 and 120 characters")
            .optional(),
        description: zod_1.z.string().min(1, "Description cannot be empty").optional(),
    })
        .refine((data) => data.title !== undefined || data.description !== undefined, {
        message: "At least one field (title or description) must be provided",
    }),
});
exports.assignTicketSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z.object({
        assignedTo: user_validator_1.objectIdSchema,
    }),
});
exports.updateTicketStatusSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(constants_1.TicketStatus),
    }),
});
exports.updateTicketPrioritySchema = zod_1.z.object({
    params: zod_1.z.object({
        id: user_validator_1.objectIdSchema,
    }),
    body: zod_1.z.object({
        priority: zod_1.z.nativeEnum(constants_1.TicketPriority),
    }),
});
exports.listTicketsQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
        search: zod_1.z.string().trim().optional(),
        status: zod_1.z.nativeEnum(constants_1.TicketStatus).optional(),
        priority: zod_1.z.nativeEnum(constants_1.TicketPriority).optional(),
        assignedTo: user_validator_1.objectIdSchema.optional(),
        createdBy: user_validator_1.objectIdSchema.optional(),
        sortBy: zod_1.z.enum(["createdAt", "updatedAt", "priority", "status", "title"]).default("createdAt"),
        sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
    }),
});
