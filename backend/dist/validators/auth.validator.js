"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z
        .object({
        username: zod_1.z
            .string()
            .min(3, "Username must be at least 3 characters")
            .max(50, "Username must not exceed 50 characters")
            .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain alphanumeric characters, underscores, and hyphens"),
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    })
        .strict(),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
});
