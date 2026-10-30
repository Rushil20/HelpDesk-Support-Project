"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("../models/user.model");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const auth_helper_1 = require("../helpers/auth.helper");
class UserService {
    static async createUser(input) {
        const existing = await user_model_1.User.findOne({
            $or: [{ email: input.email.toLowerCase() }, { username: input.username }],
        });
        if (existing) {
            if (existing.email === input.email.toLowerCase()) {
                throw ApiError_1.ApiError.conflict("Email is already registered");
            }
            throw ApiError_1.ApiError.conflict("Username is already taken");
        }
        const newUser = await user_model_1.User.create({
            username: input.username,
            email: input.email.toLowerCase(),
            password: input.password,
            role: input.role,
            status: input.status,
        });
        return (0, auth_helper_1.sanitizeUser)(newUser);
    }
    static async listUsers(query) {
        const filter = {};
        if (query.role) {
            filter.role = query.role;
        }
        if (query.status) {
            filter.status = query.status;
        }
        if (query.search) {
            const searchRegex = new RegExp(query.search.trim(), "i");
            filter.$or = [{ username: searchRegex }, { email: searchRegex }];
        }
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;
        const sortOrder = query.sortOrder === "asc" ? 1 : -1;
        const sortField = query.sortBy || "createdAt";
        const [total, users] = await Promise.all([
            user_model_1.User.countDocuments(filter),
            user_model_1.User.find(filter)
                .sort({ [sortField]: sortOrder })
                .skip(skip)
                .limit(limit),
        ]);
        const totalPages = Math.ceil(total / limit) || 1;
        return {
            items: users.map((u) => (0, auth_helper_1.sanitizeUser)(u)),
            pagination: {
                total,
                page,
                limit,
                totalPages,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1,
            },
        };
    }
    static async getUserById(id) {
        const user = await user_model_1.User.findById(id);
        if (!user) {
            throw ApiError_1.ApiError.notFound("User not found");
        }
        return (0, auth_helper_1.sanitizeUser)(user);
    }
    static async updateUser(id, input) {
        const user = await user_model_1.User.findById(id);
        if (!user) {
            throw ApiError_1.ApiError.notFound("User not found");
        }
        if (input.email && input.email.toLowerCase() !== user.email) {
            const existingEmail = await user_model_1.User.findOne({
                email: input.email.toLowerCase(),
                _id: { $ne: user._id },
            });
            if (existingEmail) {
                throw ApiError_1.ApiError.conflict("Email is already in use by another user");
            }
            user.email = input.email.toLowerCase();
        }
        if (input.username && input.username !== user.username) {
            const existingUsername = await user_model_1.User.findOne({
                username: input.username,
                _id: { $ne: user._id },
            });
            if (existingUsername) {
                throw ApiError_1.ApiError.conflict("Username is already in use by another user");
            }
            user.username = input.username;
        }
        if (input.status !== undefined) {
            user.status = input.status;
        }
        await user.save();
        return (0, auth_helper_1.sanitizeUser)(user);
    }
    static async deactivateUser(id, currentAdminId) {
        if (id === currentAdminId.toString()) {
            throw ApiError_1.ApiError.badRequest("Administrators cannot deactivate their own account");
        }
        const user = await user_model_1.User.findById(id);
        if (!user) {
            throw ApiError_1.ApiError.notFound("User not found");
        }
        user.status = constants_1.UserStatus.INACTIVE;
        await user.save();
        return (0, auth_helper_1.sanitizeUser)(user);
    }
    static async changeUserRole(targetUserId, input, currentAdminId) {
        if (targetUserId === currentAdminId.toString()) {
            throw ApiError_1.ApiError.forbidden("Administrators cannot modify their own role");
        }
        const targetUser = await user_model_1.User.findById(targetUserId);
        if (!targetUser) {
            throw ApiError_1.ApiError.notFound("Target user not found");
        }
        // Protection rule: Admin user's role cannot be modified through this API
        if (targetUser.role === constants_1.UserRole.ADMIN) {
            throw ApiError_1.ApiError.forbidden("Administrator role is protected and cannot be changed through this API");
        }
        // Role check: Only employee <-> agent transitions are allowed
        if (input.role !== constants_1.UserRole.EMPLOYEE && input.role !== constants_1.UserRole.AGENT) {
            throw ApiError_1.ApiError.badRequest("Invalid role transition. Only 'employee' and 'agent' roles are permitted");
        }
        targetUser.role = input.role;
        await targetUser.save();
        return (0, auth_helper_1.sanitizeUser)(targetUser);
    }
}
exports.UserService = UserService;
