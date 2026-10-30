"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const user_model_1 = require("../models/user.model");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.authenticate = (0, asyncHandler_1.asyncHandler)(async (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        throw ApiError_1.ApiError.unauthorized("Authentication token is missing or malformed");
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        throw ApiError_1.ApiError.unauthorized("Authentication token is missing");
    }
    // Verify token signature and expiration
    const payload = (0, jwt_1.verifyToken)(token);
    // Retrieve fresh user from database to ensure up-to-date role and status
    const user = await user_model_1.User.findById(payload.userId);
    if (!user) {
        throw ApiError_1.ApiError.unauthorized("User associated with this token no longer exists");
    }
    if (user.status !== constants_1.UserStatus.ACTIVE) {
        throw ApiError_1.ApiError.unauthorized("User account is inactive. Please contact support");
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
});
