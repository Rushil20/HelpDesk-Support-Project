"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const user_model_1 = require("../models/user.model");
const constants_1 = require("../config/constants");
const ApiError_1 = require("../utils/ApiError");
const password_1 = require("../utils/password");
const jwt_1 = require("../utils/jwt");
const auth_helper_1 = require("../helpers/auth.helper");
class AuthService {
    static async register(input) {
        const existingUser = await user_model_1.User.findOne({
            $or: [{ email: input.email.toLowerCase() }, { username: input.username }],
        });
        if (existingUser) {
            if (existingUser.email === input.email.toLowerCase()) {
                throw ApiError_1.ApiError.conflict("An account with this email already exists");
            }
            throw ApiError_1.ApiError.conflict("Username is already taken");
        }
        // Every registered user automatically receives the Employee role
        const newUser = await user_model_1.User.create({
            username: input.username,
            email: input.email.toLowerCase(),
            password: input.password,
            role: constants_1.UserRole.EMPLOYEE,
            status: constants_1.UserStatus.ACTIVE,
        });
        return (0, auth_helper_1.sanitizeUser)(newUser);
    }
    static async login(input) {
        const user = await user_model_1.User.findOne({ email: input.email.toLowerCase() }).select("+password");
        if (!user || !user.password) {
            throw ApiError_1.ApiError.unauthorized("Invalid email or password");
        }
        const isPasswordValid = await (0, password_1.verifyPassword)(input.password, user.password);
        if (!isPasswordValid) {
            throw ApiError_1.ApiError.unauthorized("Invalid email or password");
        }
        if (user.status !== constants_1.UserStatus.ACTIVE) {
            throw ApiError_1.ApiError.unauthorized("Your account is inactive. Please contact an administrator");
        }
        const accessToken = (0, jwt_1.signToken)({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
        });
        return {
            user: (0, auth_helper_1.sanitizeUser)(user),
            accessToken,
        };
    }
    static async getCurrentUser(userId) {
        const user = await user_model_1.User.findById(userId);
        if (!user) {
            throw ApiError_1.ApiError.notFound("User not found");
        }
        if (user.status !== constants_1.UserStatus.ACTIVE) {
            throw ApiError_1.ApiError.unauthorized("Your account is inactive");
        }
        return (0, auth_helper_1.sanitizeUser)(user);
    }
}
exports.AuthService = AuthService;
