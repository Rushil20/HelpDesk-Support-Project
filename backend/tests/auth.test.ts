import { describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { User } from "../src/models/user.model";
import { UserRole, UserStatus } from "../src/config/constants";

describe("Authentication APIs", () => {
  describe("POST /api/v1/auth/register", () => {
    it("should successfully register a new user with Employee role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "alice",
          email: "alice@example.com",
          password: "Password@123",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe("alice");
      expect(res.body.data.email).toBe("alice@example.com");
      expect(res.body.data.role).toBe(UserRole.EMPLOYEE);
      expect(res.body.data.status).toBe(UserStatus.ACTIVE);
      expect(res.body.data.password).toBeUndefined();

      // Verify in database
      const dbUser = await User.findOne({ email: "alice@example.com" }).select("+password");
      expect(dbUser).toBeDefined();
      expect(dbUser?.role).toBe(UserRole.EMPLOYEE);
      expect(dbUser?.password).toMatch(/^\$argon2id\$/);
    });

    it("should reject registration attempts with extra protected fields like role", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          username: "hacker",
          email: "hacker@example.com",
          password: "Password@123",
          role: "admin",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should reject duplicate email registration", async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "user1",
        email: "duplicate@example.com",
        password: "Password@123",
      });

      const res = await request(app).post("/api/v1/auth/register").send({
        username: "user2",
        email: "duplicate@example.com",
        password: "Password@123",
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("already exists");
    });
  });

  describe("POST /api/v1/auth/login", () => {
    it("should successfully authenticate with valid credentials and return JWT token", async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "bob",
        email: "bob@example.com",
        password: "Password@123",
      });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "bob@example.com",
        password: "Password@123",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe("bob@example.com");
      expect(res.body.data.user.password).toBeUndefined();
    });

    it("should reject login with wrong password", async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "charlie",
        email: "charlie@example.com",
        password: "Password@123",
      });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "charlie@example.com",
        password: "WrongPassword@999",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject login for inactive users", async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "inactive_user",
        email: "inactive@example.com",
        password: "Password@123",
      });

      await User.updateOne({ email: "inactive@example.com" }, { status: UserStatus.INACTIVE });

      const res = await request(app).post("/api/v1/auth/login").send({
        email: "inactive@example.com",
        password: "Password@123",
      });

      expect(res.status).toBe(401);
      expect(res.body.message).toContain("inactive");
    });
  });

  describe("GET /api/v1/auth/me", () => {
    it("should return the authenticated user details", async () => {
      await request(app).post("/api/v1/auth/register").send({
        username: "david",
        email: "david@example.com",
        password: "Password@123",
      });

      const loginRes = await request(app).post("/api/v1/auth/login").send({
        email: "david@example.com",
        password: "Password@123",
      });

      const token = loginRes.body.data.accessToken;

      const meRes = await request(app)
        .get("/api/v1/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(meRes.status).toBe(200);
      expect(meRes.body.data.username).toBe("david");
      expect(meRes.body.data.email).toBe("david@example.com");
      expect(meRes.body.data.role).toBe(UserRole.EMPLOYEE);
    });

    it("should reject requests without authorization token", async () => {
      const res = await request(app).get("/api/v1/auth/me");
      expect(res.status).toBe(401);
    });
  });
});

