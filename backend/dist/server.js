"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = void 0;
const app_1 = require("./app");
const env_1 = require("./config/env");
const mongodb_1 = require("./connection/mongodb");
const seed_1 = require("./config/seed");
const logger_1 = require("./utils/logger");
let server = null;
const startServer = async () => {
    try {
        logger_1.logger.info("Initializing Helpdesk Lite Backend API...");
        // 1. Connect to MongoDB
        logger_1.logger.info("Connecting to MongoDB...");
        await (0, mongodb_1.connectDatabase)();
        // 2. Run initial database seeding
        logger_1.logger.info("Executing initial user seeding...");
        await (0, seed_1.seedDatabase)();
        // 3. Start HTTP server
        server = app_1.app.listen(env_1.env.PORT, () => {
            logger_1.logger.info(`Helpdesk Lite API server is running on http://localhost:${env_1.env.PORT} in '${env_1.env.NODE_ENV}' mode`);
            logger_1.logger.info(`API Base URL: http://localhost:${env_1.env.PORT}/api/v1`);
            logger_1.logger.info(`Health check: http://localhost:${env_1.env.PORT}/api/v1/health`);
        });
        return server;
    }
    catch (error) {
        logger_1.logger.error("Failed to start application server:", error);
        process.exit(1);
    }
};
exports.startServer = startServer;
const handleGracefulShutdown = async (signal) => {
    logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(async () => {
            logger_1.logger.info("HTTP server closed.");
            await (0, mongodb_1.disconnectDatabase)();
            logger_1.logger.info("Graceful shutdown complete.");
            process.exit(0);
        });
        // Force close after 10s if graceful shutdown hangs
        setTimeout(() => {
            logger_1.logger.error("Could not close connections in time, forcefully shutting down");
            process.exit(1);
        }, 10000);
    }
    else {
        await (0, mongodb_1.disconnectDatabase)();
        process.exit(0);
    }
};
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
// Only auto-start when executed directly (not when imported in tests)
if (process.env.NODE_ENV !== "test") {
    (0, exports.startServer)();
}
