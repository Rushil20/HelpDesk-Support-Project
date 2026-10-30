"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const routes_1 = __importDefault(require("./routes"));
const notFound_middleware_1 = require("./middlewares/notFound.middleware");
const error_middleware_1 = require("./middlewares/error.middleware");
const createApp = () => {
    const app = (0, express_1.default)();
    // Security HTTP headers
    app.use((0, helmet_1.default)());
    // Cross-Origin Resource Sharing
    app.use((0, cors_1.default)({
        origin: env_1.env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    // Rate limiting to mitigate brute-force and DDoS
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 300, // limit each IP to 300 requests per windowMs
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: "Too many requests from this IP, please try again after 15 minutes",
            errors: [],
        },
    });
    if (env_1.env.NODE_ENV !== "test") {
        app.use("/api", limiter);
    }
    // Parse incoming JSON payloads
    app.use(express_1.default.json({ limit: "2mb" }));
    app.use(express_1.default.urlencoded({ extended: true, limit: "2mb" }));
    // Mount API v1 router
    app.use("/api/v1", routes_1.default);
    // 404 Catch-all handler
    app.use(notFound_middleware_1.notFoundHandler);
    // Centralized Error handler
    app.use(error_middleware_1.errorHandler);
    return app;
};
exports.createApp = createApp;
exports.app = (0, exports.createApp)();
