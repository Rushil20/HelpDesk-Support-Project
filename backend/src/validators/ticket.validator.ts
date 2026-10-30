import { z } from "zod";
import { TicketPriority, TicketStatus } from "../config/constants";
import { objectIdSchema } from "./user.validator";

export const ticketIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z
      .string()
      .min(5, "Title must be between 5 and 120 characters")
      .max(120, "Title must be between 5 and 120 characters"),
    description: z.string().min(1, "Description is required"),
    priority: z.nativeEnum(TicketPriority).default(TicketPriority.MEDIUM),
    createdBy: objectIdSchema.optional(),
  }),
});

export const updateTicketSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      title: z
        .string()
        .min(5, "Title must be between 5 and 120 characters")
        .max(120, "Title must be between 5 and 120 characters")
        .optional(),
      description: z.string().min(1, "Description cannot be empty").optional(),
    })
    .refine((data) => data.title !== undefined || data.description !== undefined, {
      message: "At least one field (title or description) must be provided",
    }),
});

export const assignTicketSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    assignedTo: objectIdSchema,
  }),
});

export const updateTicketStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(TicketStatus),
  }),
});

export const updateTicketPrioritySchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    priority: z.nativeEnum(TicketPriority),
  }),
});

export const listTicketsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().optional(),
    status: z.nativeEnum(TicketStatus).optional(),
    priority: z.nativeEnum(TicketPriority).optional(),
    assignedTo: objectIdSchema.optional(),
    createdBy: objectIdSchema.optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "priority", "status", "title"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>["body"];
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>["body"];
export type AssignTicketInput = z.infer<typeof assignTicketSchema>["body"];
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>["body"];
export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>["body"];
export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>["query"];
