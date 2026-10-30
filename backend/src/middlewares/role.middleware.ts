import { Request, Response, NextFunction } from "express";
import { UserRole } from "../config/constants";
import { ApiError } from "../utils/ApiError";

export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(ApiError.unauthorized("Authentication required"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Required role: [${allowedRoles.join(", ")}], but current role is '${req.user.role}'`
        )
      );
    }

    next();
  };
};

