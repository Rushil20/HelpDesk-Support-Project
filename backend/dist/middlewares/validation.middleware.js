"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const ApiError_1 = require("../utils/ApiError");
const validateRequest = (schema) => {
    return async (req, _res, next) => {
        try {
            const parsed = await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            // Safely assign parsed/coerced values back to request
            if (parsed && typeof parsed === "object") {
                const p = parsed;
                if (p.body !== undefined) {
                    req.body = p.body;
                }
                if (p.query !== undefined) {
                    Object.defineProperty(req, "query", {
                        value: p.query,
                        writable: true,
                        configurable: true,
                    });
                }
                if (p.params !== undefined) {
                    Object.defineProperty(req, "params", {
                        value: p.params,
                        writable: true,
                        configurable: true,
                    });
                }
            }
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const formattedErrors = error.issues.map((err) => ({
                    field: err.path.join(".").replace(/^(body|query|params)\.?/, ""),
                    location: err.path[0],
                    message: err.message,
                }));
                next(ApiError_1.ApiError.badRequest("Validation failed", formattedErrors));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
