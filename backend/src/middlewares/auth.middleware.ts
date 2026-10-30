import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt";
import { User } from "../models/user.model";
import { UserStatus } from "../config/constants";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw ApiError.unauthorized("Authentication token is missing or malformed");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      throw ApiError.unauthorized("Authentication token is missing");
    }

    // Verify token signature and expiration
    const payload = verifyToken(token);

    // Retrieve fresh user from database to ensure up-to-date role and status
    const user = await User.findById(payload.userId);

    if (!user) {
      throw ApiError.unauthorized("User associated with this token no longer exists");
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw ApiError.unauthorized("User account is inactive. Please contact support");
    }

    // Attach verified user to request
    req.user = {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  }
);
