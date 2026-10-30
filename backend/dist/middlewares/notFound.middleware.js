"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = void 0;
const ApiError_1 = require("../utils/ApiError");
const notFoundHandler = (req, _res, next) => {
    next(ApiError_1.ApiError.notFound(`Route not found: ${req.method} ${req.originalUrl}`));
};
exports.notFoundHandler = notFoundHandler;
