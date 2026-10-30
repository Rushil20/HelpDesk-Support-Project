"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config();
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(["development", "production", "test"]).default("development"),
    PORT: zod_1.z.coerce.number().default(5000),
    MONGODB_URI: zod_1.z.string().min(1, "MONGODB_URI is required"),
    JWT_ACCESS_SECRET: zod_1.z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string().default("15m"),
    CORS_ORIGIN: zod_1.z.string().default("http://localhost:3000"),
    SEED_ADMIN_PASSWORD: zod_1.z.string().min(8).default("AdminPassword@123"),
    SEED_AGENT_PASSWORD: zod_1.z.string().min(8).default("AgentPassword@123"),
    SEED_EMPLOYEE_PASSWORD: zod_1.z.string().min(8).default("EmployeePassword@123"),
});
const parsedEnv = envSchema.safeParse(process.env);
if (!parsedEnv.success) {
    console.error("❌ Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
    process.exit(1);
}
exports.env = parsedEnv.data;
