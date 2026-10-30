"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
class AuthController {
    static register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_1.AuthService.register(req.body);
        ApiResponse_1.ApiResponse.created(res, "User registered successfully", user);
    });
    static login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const result = await auth_service_1.AuthService.login(req.body);
        ApiResponse_1.ApiResponse.success(res, "Login successful", result);
    });
    static getCurrentUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await auth_service_1.AuthService.getCurrentUser(req.user._id.toString());
        ApiResponse_1.ApiResponse.success(res, "Current user retrieved successfully", user);
    });
}
exports.AuthController = AuthController;
