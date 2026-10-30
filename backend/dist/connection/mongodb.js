"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDatabase = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
const connectDatabase = async (uri) => {
    const mongoUri = uri || env_1.env.MONGODB_URI;
    try {
        mongoose_1.default.connection.on("connected", () => {
            logger_1.logger.info("Connected to MongoDB successfully");
        });
        mongoose_1.default.connection.on("error", (err) => {
            logger_1.logger.error("MongoDB connection error:", err);
        });
        mongoose_1.default.connection.on("disconnected", () => {
            logger_1.logger.warn("MongoDB connection disconnected");
        });
        const conn = await mongoose_1.default.connect(mongoUri, {
            serverSelectionTimeoutMS: 10000,
        });
        return conn;
    }
    catch (error) {
        logger_1.logger.error("Failed to connect to MongoDB:", error);
        throw error;
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await mongoose_1.default.disconnect();
        logger_1.logger.info("Disconnected from MongoDB");
    }
    catch (error) {
        logger_1.logger.error("Error disconnecting from MongoDB:", error);
    }
};
exports.disconnectDatabase = disconnectDatabase;
