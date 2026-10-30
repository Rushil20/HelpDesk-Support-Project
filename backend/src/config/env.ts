import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters"),
  JWT_ACCESS_EXPIRES_IN: z.string().default("15m"),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  SEED_ADMIN_PASSWORD: z.string().min(8).default("AdminPassword@123"),
  SEED_AGENT_PASSWORD: z.string().min(8).default("AgentPassword@123"),
  SEED_EMPLOYEE_PASSWORD: z.string().min(8).default("EmployeePassword@123"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("❌ Invalid environment variables:", JSON.stringify(parsedEnv.error.format(), null, 2));
  process.exit(1);
}

export const env = parsedEnv.data;

