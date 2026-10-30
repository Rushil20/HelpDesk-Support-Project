"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, _next) => {
    let statusCode = 500;
    let message = "Internal Server Error";
    let errors = [];
    if (err instanceof ApiError_1.ApiError) {
        statusCode = err.statusCode;
        message = err.message;
        errors = err.errors;
    }
    else if (err.code === 11000) {
        statusCode = 409;
        const mongoErr = err;
        const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : "Field";
        message = `${field} already exists`;
        errors = [mongoErr.keyValue];
    }
    else if (err.name === "CastError") {
        statusCode = 400;
        message = "Invalid identifier format";
    }
    else if (err.name === "ValidationError") {
        statusCode = 400;
        message = err.message;
    }
    else if (err instanceof SyntaxError && "body" in err) {
        statusCode = 400;
        message = "Malformed JSON payload in request body";
    }
    else {
        message = err.message || message;
    }
    if (statusCode >= 500) {
        logger_1.logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
            stack: err.stack,
        });
    }
    else if (env_1.env.NODE_ENV !== "test") {
        logger_1.logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
    }
    res.status(statusCode).json({
        success: false,
        message,
        errors,
    });
};
exports.errorHandler = errorHandler;
