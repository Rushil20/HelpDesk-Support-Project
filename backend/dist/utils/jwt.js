"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const ApiError_1 = require("./ApiError");
const signToken = (payload, expiresIn) => {
    const options = {
        expiresIn: (expiresIn || env_1.env.JWT_ACCESS_EXPIRES_IN),
    };
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_ACCESS_SECRET, options);
};
exports.signToken = signToken;
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_ACCESS_SECRET);
    }
    catch (error) {
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            throw ApiError_1.ApiError.unauthorized("Access token has expired");
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            throw ApiError_1.ApiError.unauthorized("Invalid access token");
        }
        throw ApiError_1.ApiError.unauthorized("Authentication failed");
    }
};
exports.verifyToken = verifyToken;
