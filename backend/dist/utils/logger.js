"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../config/env");
const { combine, timestamp, printf, colorize, errors, json } = winston_1.default.format;
const consoleFormat = printf(({ level, message, timestamp: time, stack }) => {
    return `${time} [${level}]: ${stack || message}`;
});
exports.logger = winston_1.default.createLogger({
    level: env_1.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), errors({ stack: true })),
    transports: [
        new winston_1.default.transports.Console({
            format: env_1.env.NODE_ENV === "production"
                ? json()
                : combine(colorize(), consoleFormat),
        }),
    ],
    silent: env_1.env.NODE_ENV === "test",
});
