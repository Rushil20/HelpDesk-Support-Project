import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { ApiError } from "../utils/ApiError";
import { logger } from "../utils/logger";
import { env } from "../config/env";

export const errorHandler: ErrorRequestHandler = (
  err: Error | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = "Internal Server Error";
  let errors: unknown[] = [];

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if ((err as { code?: number }).code === 11000) {
    statusCode = 409;
    const mongoErr = err as { keyValue?: Record<string, unknown> };
    const field = mongoErr.keyValue ? Object.keys(mongoErr.keyValue)[0] : "Field";
    message = `${field} already exists`;
    errors = [mongoErr.keyValue];
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid identifier format";
  } else if (err.name === "ValidationError") {
    statusCode = 400;
    message = err.message;
  } else if (err instanceof SyntaxError && "body" in err) {
    statusCode = 400;
    message = "Malformed JSON payload in request body";
  } else {
    message = err.message || message;
  }

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${err.message}`, {
      stack: err.stack,
    });
  } else if (env.NODE_ENV !== "test") {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode}: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
