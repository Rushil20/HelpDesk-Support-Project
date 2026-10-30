import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { User } from "../src/models/user.model";
import { Ticket } from "../src/models/ticket.model";
import { UserRole, UserStatus, TicketPriority, TicketStatus } from "../src/config/constants";
import { signToken } from "../src/utils/jwt";

describe("Ticket Management APIs", () => {
  let adminToken: string;
  let agentToken: string;
  let employee1Token: string;
  let employee2Token: string;

  let admin: InstanceType<typeof User>;
  let employee1: InstanceType<typeof User>;
  let employee2: InstanceType<typeof User>;
  let agent: InstanceType<typeof User>;

  beforeEach(async () => {
    admin = await User.create({
      username: "admin_ticket",
      email: "admin_t@example.com",
      password: "Password@123",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    agent = await User.create({
      username: "agent_ticket",
      email: "agent_t@example.com",
      password: "Password@123",
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    });

    employee1 = await User.create({
      username: "emp1_ticket",
      email: "emp1_t@example.com",
      password: "Password@123",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    employee2 = await User.create({
      username: "emp2_ticket",
      email: "emp2_t@example.com",
      password: "Password@123",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    adminToken = signToken({ userId: admin._id.toString(), email: admin.email, role: admin.role });
    agentToken = signToken({ userId: agent._id.toString(), email: agent.email, role: agent.role });
    employee1Token = signToken({ userId: employee1._id.toString(), email: employee1.email, role: employee1.role });
    employee2Token = signToken({ userId: employee2._id.toString(), email: employee2.email, role: employee2.role });
  });

  describe("POST /api/v1/tickets", () => {
    it("should allow Employee to create ticket for themselves", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          title: "Network Connection Issue",
          description: "Cannot connect to the office VPN network.",
          priority: "high",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe("Network Connection Issue");
      expect(res.body.data.priority).toBe(TicketPriority.HIGH);
      expect(res.body.data.status).toBe(TicketStatus.OPEN);
      expect(res.body.data.createdBy._id).toBe(employee1._id.toString());
    });

    it("should allow Agent to create ticket on behalf of an Employee", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          title: "Hardware Replacement",
          description: "Keyboard key is broken.",
          priority: "medium",
          createdBy: employee1._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.createdBy._id).toBe(employee1._id.toString());
      expect(res.body.data.createdBy._id).not.toBe(agent._id.toString());
    });

    it("should reject ticket creation by Agent if createdBy employee is missing", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          title: "Missing Creator Ticket",
          description: "Agent didn't provide employee ID.",
          priority: "low",
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Agents and Admins must specify 'createdBy'");
    });

    it("should allow Admin to create ticket on behalf of an Employee with employee ID as createdBy", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          title: "Admin Created For Employee",
          description: "Created directly by administrator for employee2.",
          priority: "high",
          createdBy: employee2._id.toString(),
        });

      expect(res.status).toBe(201);
      expect(res.body.data.createdBy._id).toBe(employee2._id.toString());
      expect(res.body.data.createdBy._id).not.toBe(admin._id.toString());
    });

    it("should reject ticket creation on behalf of non-employee user", async () => {
      const res = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          title: "Server Error",
          description: "Internal crash",
          createdBy: agent._id.toString(),
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("role");
    });

    it("should prevent a user from creating multiple tickets with the same title using transactions", async () => {
      // First ticket creation succeeds
      const firstRes = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          title: "Duplicate Title Ticket",
          description: "Initial description.",
          priority: "medium",
        });

      expect(firstRes.status).toBe(201);

      // Attempt to create another ticket with the exact same title by same user
      const duplicateRes = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          title: "Duplicate Title Ticket",
          description: "Second attempt with same title.",
          priority: "high",
        });

      expect(duplicateRes.status).toBe(409);
      expect(duplicateRes.body.success).toBe(false);
      expect(duplicateRes.body.message).toContain("already exists");

      // Verify only 1 ticket was created in DB
      const count = await Ticket.countDocuments({
        createdBy: employee1._id,
        title: "Duplicate Title Ticket",
      });
      expect(count).toBe(1);
    });

    it("should allow another user to create a ticket with the same title without collision", async () => {
      const resUser1 = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          title: "Shared Common Title",
          description: "User 1 description.",
        });
      expect(resUser1.status).toBe(201);

      const resUser2 = await request(app)
        .post("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee2Token}`)
        .send({
          title: "Shared Common Title",
          description: "User 2 description.",
        });
      expect(resUser2.status).toBe(201);
    });
  });

  describe("GET /api/v1/tickets (Ownership & Authorization)", () => {
    let ticket1: InstanceType<typeof Ticket>;
    let ticket2: InstanceType<typeof Ticket>;

    beforeEach(async () => {
      ticket1 = await Ticket.create({
        title: "Ticket One for Emp1",
        description: "Emp1 issue description",
        priority: TicketPriority.LOW,
        status: TicketStatus.OPEN,
        createdBy: employee1._id,
      });

      ticket2 = await Ticket.create({
        title: "Ticket Two for Emp2",
        description: "Emp2 issue description",
        priority: TicketPriority.HIGH,
        status: TicketStatus.OPEN,
        createdBy: employee2._id,
      });
    });

    it("should only return employee's own tickets to that employee", async () => {
      const res = await request(app)
        .get("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(1);
      expect(res.body.data.items[0]._id).toBe(ticket1._id.toString());
    });

    it("should return all tickets to Agent and Admin", async () => {
      const agentRes = await request(app)
        .get("/api/v1/tickets")
        .set("Authorization", `Bearer ${agentToken}`);

      expect(agentRes.status).toBe(200);
      expect(agentRes.body.data.items.length).toBe(2);

      const adminRes = await request(app)
        .get("/api/v1/tickets")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.data.items.length).toBe(2);
    });

    it("should prevent Employee from accessing another employee's ticket by ID", async () => {
      const res = await request(app)
        .get(`/api/v1/tickets/${ticket2._id}`)
        .set("Authorization", `Bearer ${employee1Token}`);

      expect(res.status).toBe(403);
      expect(res.body.message).toContain("not authorized");
    });
  });

  describe("PATCH /api/v1/tickets/:id/assign", () => {
    let ticket: InstanceType<typeof Ticket>;

    beforeEach(async () => {
      ticket = await Ticket.create({
        title: "Sample Unassigned Ticket",
        description: "Ticket awaiting assignment",
        priority: TicketPriority.MEDIUM,
        status: TicketStatus.OPEN,
        createdBy: employee1._id,
      });
    });

    it("should allow Agent to assign ticket to themselves or another agent", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/assign`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ assignedTo: agent._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.data.assignedTo._id).toBe(agent._id.toString());
    });

    it("should prevent Employee from assigning tickets", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/assign`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({ assignedTo: agent._id.toString() });

      expect(res.status).toBe(403);
    });

    it("should reject assignment to a non-agent user (e.g. employee)", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/assign`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ assignedTo: employee2._id.toString() });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("agent");
    });
  });

  describe("PATCH /api/v1/tickets/:id/priority & /status", () => {
    let ticket: InstanceType<typeof Ticket>;

    beforeEach(async () => {
      ticket = await Ticket.create({
        title: "Status and Priority Test Ticket",
        description: "Testing priority and status updates",
        priority: TicketPriority.LOW,
        status: TicketStatus.OPEN,
        createdBy: employee1._id,
      });
    });

    it("should allow Agent to update priority", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/priority`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ priority: "high" });

      expect(res.status).toBe(200);
      expect(res.body.data.priority).toBe(TicketPriority.HIGH);
    });

    it("should forbid Employee from updating ticket priority", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/priority`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({ priority: "high" });

      expect(res.status).toBe(403);
    });

    it("should allow Agent to update status to in_progress and resolved", async () => {
      const res = await request(app)
        .patch(`/api/v1/tickets/${ticket._id}/status`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ status: "in_progress" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe(TicketStatus.IN_PROGRESS);
    });
  });

  describe("DELETE /api/v1/tickets/:id", () => {
    it("should soft-delete ticket by setting deletedAt", async () => {
      const ticket = await Ticket.create({
        title: "Ticket to be deleted",
        description: "Soft deletion test",
        priority: TicketPriority.LOW,
        status: TicketStatus.OPEN,
        createdBy: employee1._id,
      });

      const res = await request(app)
        .delete(`/api/v1/tickets/${ticket._id}`)
        .set("Authorization", `Bearer ${employee1Token}`);

      expect(res.status).toBe(200);

      const dbTicket = await Ticket.findById(ticket._id);
      expect(dbTicket?.deletedAt).toBeInstanceOf(Date);

      // Verify that list tickets excludes soft deleted
      const listRes = await request(app)
        .get("/api/v1/tickets")
        .set("Authorization", `Bearer ${employee1Token}`);
      expect(listRes.body.data.items.length).toBe(0);
    });
  });
});

