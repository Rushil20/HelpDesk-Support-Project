import { User } from "../models/user.model";
import { UserRole, UserStatus } from "./constants";
import { env } from "./env";
import { logger } from "../utils/logger";
import { hashPassword } from "../utils/password";

interface SeedUserDefinition {
  username: string;
  email: string;
  role: UserRole;
  getPassword: () => string;
}

const SEED_USERS: SeedUserDefinition[] = [
  {
    username: "admin",
    email: "admin@yopmail.com",
    role: UserRole.ADMIN,
    getPassword: () => env.SEED_ADMIN_PASSWORD,
  },
  {
    username: "agent",
    email: "agent@yopmail.com",
    role: UserRole.AGENT,
    getPassword: () => env.SEED_AGENT_PASSWORD,
  },
  {
    username: "employee",
    email: "employee@yopmail.com",
    role: UserRole.EMPLOYEE,
    getPassword: () => env.SEED_EMPLOYEE_PASSWORD,
  },
];

export const seedDatabase = async (): Promise<void> => {
  try {
    for (const seedUser of SEED_USERS) {
      const existingUser = await User.findOne({
        $or: [{ email: seedUser.email.toLowerCase() }, { username: seedUser.username }],
      });

      if (existingUser) {
        logger.info(
          `Seed user '${seedUser.username}' (${seedUser.email}) already exists. Leaving unchanged.`
        );
        continue;
      }

      try {
        const hashedPassword = await hashPassword(seedUser.getPassword());
        await User.create({
          username: seedUser.username,
          email: seedUser.email.toLowerCase(),
          password: hashedPassword,
          role: seedUser.role,
          status: UserStatus.ACTIVE,
        });

        logger.info(`Seeded ${seedUser.role} user: ${seedUser.username} (${seedUser.email})`);
      } catch (err: unknown) {
        // Handle race conditions or duplicate key error (code 11000)
        const mongoError = err as { code?: number };
        if (mongoError.code === 11000) {
          logger.info(`Seed user '${seedUser.username}' created concurrently. Skipping.`);
        } else {
          logger.error(`Failed to seed user '${seedUser.username}':`, err);
          throw err;
        }
      }
    }
  } catch (error) {
    logger.error("Error during database seeding:", error);
    throw error;
  }
};

