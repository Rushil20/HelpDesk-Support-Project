"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("../services/user.service");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
class UserController {
    static createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.UserService.createUser(req.body);
        ApiResponse_1.ApiResponse.created(res, "User created successfully", user);
    });
    static listUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const query = req.query;
        const result = await user_service_1.UserService.listUsers(query);
        ApiResponse_1.ApiResponse.success(res, "Users retrieved successfully", result);
    });
    static getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.UserService.getUserById(req.params.id);
        ApiResponse_1.ApiResponse.success(res, "User details retrieved successfully", user);
    });
    static updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.UserService.updateUser(req.params.id, req.body);
        ApiResponse_1.ApiResponse.success(res, "User updated successfully", user);
    });
    static deactivateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.UserService.deactivateUser(req.params.id, req.user._id);
        ApiResponse_1.ApiResponse.success(res, "User deactivated successfully", user);
    });
    static changeUserRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const user = await user_service_1.UserService.changeUserRole(req.params.id, req.body, req.user._id);
        ApiResponse_1.ApiResponse.success(res, "User role updated successfully", user);
    });
}
exports.UserController = UserController;
