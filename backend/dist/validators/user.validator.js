"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listUsersQuerySchema = exports.changeUserRoleSchema = exports.updateUserSchema = exports.createUserSchema = exports.userIdParamSchema = exports.objectIdSchema = void 0;
const zod_1 = require("zod");
const mongoose_1 = require("mongoose");
const constants_1 = require("../config/constants");
exports.objectIdSchema = zod_1.z.string().refine((val) => mongoose_1.Types.ObjectId.isValid(val), {
    message: "Invalid MongoDB ObjectId format",
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: exports.objectIdSchema,
    }),
});
exports.createUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        username: zod_1.z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username must not exceed 50 characters")
            .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
        role: zod_1.z.enum([constants_1.UserRole.EMPLOYEE, constants_1.UserRole.AGENT]).default(constants_1.UserRole.EMPLOYEE),
        status: zod_1.z.nativeEnum(constants_1.UserStatus).default(constants_1.UserStatus.ACTIVE),
    }),
});
exports.updateUserSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: exports.objectIdSchema,
    }),
    body: zod_1.z
        .object({
        username: zod_1.z
            .string()
            .min(3)
            .max(50)
            .regex(/^[a-zA-Z0-9_-]+$/)
            .optional(),
        email: zod_1.z.string().email().optional(),
        status: zod_1.z.nativeEnum(constants_1.UserStatus).optional(),
    })
        .strict(),
});
exports.changeUserRoleSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: exports.objectIdSchema,
    }),
    body: zod_1.z
        .object({
        role: zod_1.z.enum([constants_1.UserRole.EMPLOYEE, constants_1.UserRole.AGENT]),
    })
        .strict(),
});
exports.listUsersQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        page: zod_1.z.coerce.number().int().positive().default(1),
        limit: zod_1.z.coerce.number().int().positive().max(100).default(10),
        search: zod_1.z.string().trim().optional(),
        role: zod_1.z.nativeEnum(constants_1.UserRole).optional(),
        status: zod_1.z.nativeEnum(constants_1.UserStatus).optional(),
        sortBy: zod_1.z.enum(["createdAt", "updatedAt", "username", "email", "role", "status"]).default("createdAt"),
        sortOrder: zod_1.z.enum(["asc", "desc"]).default("desc"),
    }),
});
