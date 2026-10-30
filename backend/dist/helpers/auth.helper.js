"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = void 0;
const sanitizeUser = (user) => {
    return {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};
exports.sanitizeUser = sanitizeUser;
