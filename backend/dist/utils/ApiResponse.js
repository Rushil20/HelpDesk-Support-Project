"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    success;
    message;
    data;
    constructor(success, message, data) {
        this.success = success;
        this.message = message;
        if (data !== undefined) {
            this.data = data;
        }
    }
    static send(res, statusCode, message, data) {
        return res.status(statusCode).json(new ApiResponse(true, message, data));
    }
    static success(res, message, data) {
        return ApiResponse.send(res, 200, message, data);
    }
    static created(res, message, data) {
        return ApiResponse.send(res, 201, message, data);
    }
}
exports.ApiResponse = ApiResponse;
