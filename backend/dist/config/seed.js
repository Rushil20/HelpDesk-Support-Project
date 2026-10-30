"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const user_model_1 = require("../models/user.model");
const constants_1 = require("./constants");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const password_1 = require("../utils/password");
const SEED_USERS = [
    {
        username: "admin",
        email: "admin@yopmail.com",
        role: constants_1.UserRole.ADMIN,
        getPassword: () => env_1.env.SEED_ADMIN_PASSWORD,
    },
    {
        username: "agent",
        email: "agent@yopmail.com",
        role: constants_1.UserRole.AGENT,
        getPassword: () => env_1.env.SEED_AGENT_PASSWORD,
    },
    {
        username: "employee",
        email: "employee@yopmail.com",
        role: constants_1.UserRole.EMPLOYEE,
        getPassword: () => env_1.env.SEED_EMPLOYEE_PASSWORD,
    },
];
const seedDatabase = async () => {
    try {
        for (const seedUser of SEED_USERS) {
            const existingUser = await user_model_1.User.findOne({
                $or: [{ email: seedUser.email.toLowerCase() }, { username: seedUser.username }],
            });
            if (existingUser) {
                logger_1.logger.info(`Seed user '${seedUser.username}' (${seedUser.email}) already exists. Leaving unchanged.`);
                continue;
            }
            try {
                const hashedPassword = await (0, password_1.hashPassword)(seedUser.getPassword());
                await user_model_1.User.create({
                    username: seedUser.username,
                    email: seedUser.email.toLowerCase(),
                    password: hashedPassword,
                    role: seedUser.role,
                    status: constants_1.UserStatus.ACTIVE,
                });
                logger_1.logger.info(`Seeded ${seedUser.role} user: ${seedUser.username} (${seedUser.email})`);
            }
            catch (err) {
                // Handle race conditions or duplicate key error (code 11000)
                const mongoError = err;
                if (mongoError.code === 11000) {
                    logger_1.logger.info(`Seed user '${seedUser.username}' created concurrently. Skipping.`);
                }
                else {
                    logger_1.logger.error(`Failed to seed user '${seedUser.username}':`, err);
                    throw err;
                }
            }
        }
    }
    catch (error) {
        logger_1.logger.error("Error during database seeding:", error);
        throw error;
    }
};
exports.seedDatabase = seedDatabase;
