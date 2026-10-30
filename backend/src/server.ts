import http from "http";
import { app } from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./connection/mongodb";
import { seedDatabase } from "./config/seed";
import { logger } from "./utils/logger";

let server: http.Server | null = null;

export const startServer = async (): Promise<http.Server> => {
  try {
    logger.info("Initializing Helpdesk Lite Backend API...");

    // 1. Connect to MongoDB
    logger.info("Connecting to MongoDB...");
    await connectDatabase();

    // 2. Run initial database seeding
    logger.info("Executing initial user seeding...");
    await seedDatabase();

    // 3. Start HTTP server
    server = app.listen(env.PORT, () => {
      logger.info(
        `Helpdesk Lite API server is running on http://localhost:${env.PORT} in '${env.NODE_ENV}' mode`
      );
      logger.info(`API Base URL: http://localhost:${env.PORT}/api/v1`);
      logger.info(`Health check: http://localhost:${env.PORT}/api/v1/health`);
    });

    return server;
  } catch (error) {
    logger.error("Failed to start application server:", error);
    process.exit(1);
  }
};

const handleGracefulShutdown = async (signal: string) => {
  logger.info(`Received ${signal}. Shutting down gracefully...`);

  if (server) {
    server.close(async () => {
      logger.info("HTTP server closed.");
      await disconnectDatabase();
      logger.info("Graceful shutdown complete.");
      process.exit(0);
    });

    // Force close after 10s if graceful shutdown hangs
    setTimeout(() => {
      logger.error("Could not close connections in time, forcefully shutting down");
      process.exit(1);
    }, 10000);
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));

// Only auto-start when executed directly (not when imported in tests)
if (process.env.NODE_ENV !== "test") {
  startServer();
}

