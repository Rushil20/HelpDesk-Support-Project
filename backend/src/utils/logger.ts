import winston from "winston";
import { env } from "../config/env";

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const consoleFormat = printf(({ level, message, timestamp: time, stack }) => {
  return `${time} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true })
  ),
  transports: [
    new winston.transports.Console({
      format:
        env.NODE_ENV === "production"
          ? json()
          : combine(colorize(), consoleFormat),
    }),
  ],
  silent: env.NODE_ENV === "test",
});

