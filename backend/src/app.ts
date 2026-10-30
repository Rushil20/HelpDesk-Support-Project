import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";
import apiRoutes from "./routes";
import { notFoundHandler } from "./middlewares/notFound.middleware";
import { errorHandler } from "./middlewares/error.middleware";

export const createApp = (): Application => {
  const app = express();

  // Security HTTP headers
  app.use(helmet());

  // Cross-Origin Resource Sharing
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  // Rate limiting to mitigate brute-force and DDoS
  const limiter = rateLimit({
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

  if (env.NODE_ENV !== "test") {
    app.use("/api", limiter);
  }

  // Parse incoming JSON payloads
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true, limit: "2mb" }));

  // Mount API v1 router
  app.use("/api/v1", apiRoutes);

  // 404 Catch-all handler
  app.use(notFoundHandler);

  // Centralized Error handler
  app.use(errorHandler);

  return app;
};

export const app = createApp();

