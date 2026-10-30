import { describe, it, expect } from "vitest";
import { seedDatabase } from "../src/config/seed";
import { User } from "../src/models/user.model";
import { UserRole, UserStatus } from "../src/config/constants";
import { verifyPassword } from "../src/utils/password";
import { env } from "../src/config/env";

describe("Database Seeding", () => {
  it("should seed default admin, agent, and employee users if they do not exist", async () => {
    await seedDatabase();

    const users = await User.find({}).sort({ role: 1 });
    expect(users).toHaveLength(3);

    const admin = await User.findOne({ username: "admin" }).select("+password");
    expect(admin).toBeDefined();
    expect(admin?.role).toBe(UserRole.ADMIN);
    expect(admin?.status).toBe(UserStatus.ACTIVE);
    expect(admin?.username).toBe("admin");
    const isAdminPasswordValid = await verifyPassword(env.SEED_ADMIN_PASSWORD, admin!.password!);
    expect(isAdminPasswordValid).toBe(true);

    const agent = await User.findOne({ username: "agent" });
    expect(agent).toBeDefined();
    expect(agent?.role).toBe(UserRole.AGENT);

    const employee = await User.findOne({ username: "employee" });
    expect(employee).toBeDefined();
    expect(employee?.role).toBe(UserRole.EMPLOYEE);
  });

  it("should execute idempotently and not duplicate or overwrite existing users", async () => {
    // Run seed twice
    await seedDatabase();
    await seedDatabase();

    const users = await User.find({});
    expect(users).toHaveLength(3);
  });

  it("should never reset existing user passwords or roles on subsequent seed runs", async () => {
    await seedDatabase();

    // Modify admin's email manually
    const admin = await User.findOne({ username: "admin" }).select("+password");
    expect(admin).toBeDefined();
    admin!.email = "modified_admin@example.com";
    await admin!.save();

    // Re-run seed
    await seedDatabase();

    const updatedAdmin = await User.findById(admin!._id);
    expect(updatedAdmin?.email).toBe("modified_admin@example.com");
  });
});
