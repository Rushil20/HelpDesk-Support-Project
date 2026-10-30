import mongoose from "mongoose";
import { env } from "../config/env";
import { logger } from "../utils/logger";

export const connectDatabase = async (uri?: string): Promise<typeof mongoose> => {
  const mongoUri = uri || env.MONGODB_URI;

  try {
    mongoose.connection.on("connected", () => {
      logger.info("Connected to MongoDB successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected");
    });

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    return conn;
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info("Disconnected from MongoDB");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
  }
};

