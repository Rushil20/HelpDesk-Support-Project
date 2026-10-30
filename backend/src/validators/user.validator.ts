import { z } from "zod";
import { Types } from "mongoose";
import { UserRole, UserStatus } from "../config/constants";

export const objectIdSchema = z.string().refine((val) => Types.ObjectId.isValid(val), {
  message: "Invalid MongoDB ObjectId format",
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(50, "Username must not exceed 50 characters")
      .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum([UserRole.EMPLOYEE, UserRole.AGENT]).default(UserRole.EMPLOYEE),
    status: z.nativeEnum(UserStatus).default(UserStatus.ACTIVE),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      username: z
        .string()
        .min(3)
        .max(50)
        .regex(/^[a-zA-Z0-9_-]+$/)
        .optional(),
      email: z.string().email().optional(),
      password: z.string().min(8, "Password must be at least 8 characters").optional(),
      status: z.nativeEnum(UserStatus).optional(),
    })
    .strict(),
});

export const changeUserRoleSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      role: z.enum([UserRole.EMPLOYEE, UserRole.AGENT]),
    })
    .strict(),
});

export const listUsersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    search: z.string().trim().optional(),
    role: z.nativeEnum(UserRole).optional(),
    status: z.nativeEnum(UserStatus).optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "username", "email", "role", "status"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateUserInput = z.infer<typeof createUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserSchema>["body"];
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>["body"];
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>["query"];
