import { Types } from "mongoose";
import { User, IUserDocument } from "../models/user.model";
import { UserRole, UserStatus } from "../config/constants";
import {
  CreateUserInput,
  UpdateUserInput,
  ListUsersQuery,
  ChangeUserRoleInput,
} from "../validators/user.validator";
import { ApiError } from "../utils/ApiError";
import { sanitizeUser, SanitizedUser } from "../helpers/auth.helper";
import { PaginatedResult } from "../types/common.types";

export class UserService {
  static async createUser(input: CreateUserInput): Promise<SanitizedUser> {
    const existing = await User.findOne({
      $or: [{ email: input.email.toLowerCase() }, { username: input.username }],
    });

    if (existing) {
      if (existing.email === input.email.toLowerCase()) {
        throw ApiError.conflict("Email is already registered");
      }
      throw ApiError.conflict("Username is already taken");
    }

    const newUser = await User.create({
      username: input.username,
      email: input.email.toLowerCase(),
      password: input.password,
      role: input.role,
      status: input.status,
    });

    return sanitizeUser(newUser);
  }

  static async listUsers(query: ListUsersQuery): Promise<PaginatedResult<SanitizedUser>> {
    const filter: Record<string, unknown> = {};

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
      User.countDocuments(filter),
      User.find(filter)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items: users.map((u: IUserDocument) => sanitizeUser(u)),
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

  static async getUserById(id: string): Promise<SanitizedUser> {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }
    return sanitizeUser(user);
  }

  static async updateUser(id: string, input: UpdateUserInput): Promise<SanitizedUser> {
    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    if (input.email && input.email.toLowerCase() !== user.email) {
      const existingEmail = await User.findOne({
        email: input.email.toLowerCase(),
        _id: { $ne: user._id },
      });
      if (existingEmail) {
        throw ApiError.conflict("Email is already in use by another user");
      }
      user.email = input.email.toLowerCase();
    }

    if (input.username && input.username !== user.username) {
      const existingUsername = await User.findOne({
        username: input.username,
        _id: { $ne: user._id },
      });
      if (existingUsername) {
        throw ApiError.conflict("Username is already in use by another user");
      }
      user.username = input.username;
    }

    if (input.status !== undefined) {
      user.status = input.status;
    }

    if (input.password) {
      user.password = input.password;
    }

    await user.save();
    return sanitizeUser(user);
  }

  static async deactivateUser(id: string, currentAdminId: Types.ObjectId): Promise<SanitizedUser> {
    if (id === currentAdminId.toString()) {
      throw ApiError.badRequest("Administrators cannot deactivate their own account");
    }

    const user = await User.findById(id);
    if (!user) {
      throw ApiError.notFound("User not found");
    }

    user.status = UserStatus.INACTIVE;
    await user.save();

    return sanitizeUser(user);
  }

  static async changeUserRole(
    targetUserId: string,
    input: ChangeUserRoleInput,
    currentAdminId: Types.ObjectId
  ): Promise<SanitizedUser> {
    if (targetUserId === currentAdminId.toString()) {
      throw ApiError.forbidden("Administrators cannot modify their own role");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw ApiError.notFound("Target user not found");
    }

    // Protection rule: Admin user's role cannot be modified through this API
    if (targetUser.role === UserRole.ADMIN) {
      throw ApiError.forbidden(
        "Administrator role is protected and cannot be changed through this API"
      );
    }

    // Role check: Only employee <-> agent transitions are allowed
    if (input.role !== UserRole.EMPLOYEE && input.role !== UserRole.AGENT) {
      throw ApiError.badRequest(
        "Invalid role transition. Only 'employee' and 'agent' roles are permitted"
      );
    }

    targetUser.role = input.role;
    await targetUser.save();

    return sanitizeUser(targetUser);
  }
}
