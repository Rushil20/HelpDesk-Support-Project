"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = void 0;
const ApiError_1 = require("../utils/ApiError");
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(ApiError_1.ApiError.unauthorized("Authentication required"));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(ApiError_1.ApiError.forbidden(`Access denied. Required role: [${allowedRoles.join(", ")}], but current role is '${req.user.role}'`));
        }
        next();
    };
};
exports.requireRole = requireRole;
