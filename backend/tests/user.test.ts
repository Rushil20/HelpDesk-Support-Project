import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { User } from "../src/models/user.model";
import { UserRole, UserStatus } from "../src/config/constants";
import { signToken } from "../src/utils/jwt";

describe("User Management APIs", () => {
  let adminToken: string;
  let agentToken: string;
  let employeeToken: string;
  let adminUser: InstanceType<typeof User>;
  let employeeUser: InstanceType<typeof User>;

  beforeEach(async () => {
    adminUser = await User.create({
      username: "admin_test",
      email: "admin_test@example.com",
      password: "Password@123",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    const agentUser = await User.create({
      username: "agent_test",
      email: "agent_test@example.com",
      password: "Password@123",
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    });

    employeeUser = await User.create({
      username: "employee_test",
      email: "employee_test@example.com",
      password: "Password@123",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    adminToken = signToken({
      userId: adminUser._id.toString(),
      email: adminUser.email,
      role: adminUser.role,
    });

    agentToken = signToken({
      userId: agentUser._id.toString(),
      email: agentUser.email,
      role: agentUser.role,
    });

    employeeToken = signToken({
      userId: employeeUser._id.toString(),
      email: employeeUser.email,
      role: employeeUser.role,
    });
  });

  describe("Access Control", () => {
    it("should prevent Employees and Agents from accessing Admin user APIs", async () => {
      const empRes = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${employeeToken}`);
      expect(empRes.status).toBe(403);

      const agentRes = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${agentToken}`);
      expect(agentRes.status).toBe(403);
    });
  });

  describe("GET /api/v1/users", () => {
    it("should list users with pagination, search, and filtering", async () => {
      const res = await request(app)
        .get("/api/v1/users?page=1&limit=10&role=employee")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].email).toBe("employee_test@example.com");
      expect(res.body.data.pagination.total).toBe(1);
    });

    it("should search users by keyword", async () => {
      const res = await request(app)
        .get("/api/v1/users?search=admin_test")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0].username).toBe("admin_test");
    });
  });

  describe("PATCH /api/v1/users/:id/role", () => {
    it("should allow Admin to change Employee role to Agent", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${employeeUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "agent" });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe(UserRole.AGENT);

      // Verify in DB
      const updated = await User.findById(employeeUser._id);
      expect(updated?.role).toBe(UserRole.AGENT);
    });

    it("should allow Admin to change Agent role to Employee", async () => {
      // First promote
      await User.updateOne({ _id: employeeUser._id }, { role: UserRole.AGENT });

      // Demote back
      const res = await request(app)
        .patch(`/api/v1/users/${employeeUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "employee" });

      expect(res.status).toBe(200);
      expect(res.body.data.role).toBe(UserRole.EMPLOYEE);
    });

    it("should reject Admin role assignment attempt", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${employeeUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "admin" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should protect Admin role from being changed", async () => {
      const otherAdmin = await User.create({
        username: "other_admin",
        email: "other_admin@example.com",
        password: "Password@123",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
      });

      const res = await request(app)
        .patch(`/api/v1/users/${otherAdmin._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "employee" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("protected");
    });

    it("should prevent Admin from changing their own role", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${adminUser._id}/role`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "employee" });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("cannot modify their own role");
    });

    it("should handle invalid ObjectId format gracefully", async () => {
      const res = await request(app)
        .patch("/api/v1/users/invalid-id/role")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ role: "agent" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe("PATCH /api/v1/users/:id", () => {
    it("should not allow profile updates to modify user role", async () => {
      const res = await request(app)
        .patch(`/api/v1/users/${employeeUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          username: "updated_employee",
          role: "agent",
        });

      // Strict validation forbids role in profile update
      expect(res.status).toBe(400);
    });
  });

  describe("DELETE /api/v1/users/:id", () => {
    it("should deactivate user rather than physically delete", async () => {
      const res = await request(app)
        .delete(`/api/v1/users/${employeeUser._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(UserStatus.INACTIVE);

      const dbUser = await User.findById(employeeUser._id);
      expect(dbUser).toBeDefined();
      expect(dbUser?.status).toBe(UserStatus.INACTIVE);
    });
  });
});

