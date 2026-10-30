import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { User } from "../src/models/user.model";
import { Ticket } from "../src/models/ticket.model";
import { Comment } from "../src/models/comment.model";
import { UserRole, UserStatus, TicketPriority, TicketStatus } from "../src/config/constants";
import { signToken } from "../src/utils/jwt";

describe("Ticket Comments APIs", () => {
  let adminToken: string;
  let agentToken: string;
  let employee1Token: string;
  let employee2Token: string;

  let employee1: InstanceType<typeof User>;
  let employee2: InstanceType<typeof User>;
  let agent: InstanceType<typeof User>;
  let admin: InstanceType<typeof User>;
  let ticket: InstanceType<typeof Ticket>;

  beforeEach(async () => {
    admin = await User.create({
      username: "admin_c",
      email: "admin_c@example.com",
      password: "Password@123",
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
    });

    agent = await User.create({
      username: "agent_c",
      email: "agent_c@example.com",
      password: "Password@123",
      role: UserRole.AGENT,
      status: UserStatus.ACTIVE,
    });

    employee1 = await User.create({
      username: "emp1_c",
      email: "emp1_c@example.com",
      password: "Password@123",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    employee2 = await User.create({
      username: "emp2_c",
      email: "emp2_c@example.com",
      password: "Password@123",
      role: UserRole.EMPLOYEE,
      status: UserStatus.ACTIVE,
    });

    adminToken = signToken({ userId: admin._id.toString(), email: admin.email, role: admin.role });
    agentToken = signToken({ userId: agent._id.toString(), email: agent.email, role: agent.role });
    employee1Token = signToken({ userId: employee1._id.toString(), email: employee1.email, role: employee1.role });
    employee2Token = signToken({ userId: employee2._id.toString(), email: employee2.email, role: employee2.role });

    ticket = await Ticket.create({
      title: "Ticket for Comments Test",
      description: "Comments discussion thread",
      priority: TicketPriority.MEDIUM,
      status: TicketStatus.OPEN,
      createdBy: employee1._id,
    });
  });

  describe("POST /api/v1/tickets/:id/comments", () => {
    it("should allow Employee to add text comment to their own ticket", async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          message: "Here is an update regarding the problem.",
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe("Here is an update regarding the problem.");
      expect(res.body.data.authorId._id).toBe(employee1._id.toString());
      expect(res.body.data.isRead).toBe(false);
    });

    it("should allow adding attachment-only message", async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          message: "",
          attachments: [
            {
              fileName: "screenshot-123.png",
              originalName: "error.png",
              fileUrl: "https://storage.example.com/screenshot-123.png",
              mimeType: "image/png",
              size: 204800,
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.attachments.length).toBe(1);
      expect(res.body.data.attachments[0].fileName).toBe("screenshot-123.png");
    });

    it("should reject empty comment with neither text nor attachments", async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({
          message: "   ",
          attachments: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("should forbid another employee from commenting on someone else's ticket", async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${employee2Token}`)
        .send({
          message: "Unauthorized attempt",
        });

      expect(res.status).toBe(403);
    });

    it("should allow Agent to reply to ticket", async () => {
      const res = await request(app)
        .post(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({
          message: "We are currently investigating your request.",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.authorId._id).toBe(agent._id.toString());
    });
  });

  describe("GET /api/v1/tickets/:id/comments", () => {
    it("should return comments sorted chronologically by createdAt and _id", async () => {
      await Comment.create({
        ticketId: ticket._id,
        authorId: employee1._id,
        message: "Message 1",
        createdAt: new Date("2026-10-30T10:00:00Z"),
      });

      await Comment.create({
        ticketId: ticket._id,
        authorId: agent._id,
        message: "Message 2",
        createdAt: new Date("2026-10-30T10:05:00Z"),
      });

      const res = await request(app)
        .get(`/api/v1/tickets/${ticket._id}/comments`)
        .set("Authorization", `Bearer ${employee1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBe(2);
      expect(res.body.data.items[0].message).toBe("Message 1");
      expect(res.body.data.items[1].message).toBe("Message 2");
    });
  });

  describe("PATCH & DELETE /api/v1/comments/:id", () => {
    let comment: InstanceType<typeof Comment>;

    beforeEach(async () => {
      comment = await Comment.create({
        ticketId: ticket._id,
        authorId: employee1._id,
        message: "Initial comment",
      });
    });

    it("should allow author to update comment", async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set("Authorization", `Bearer ${employee1Token}`)
        .send({ message: "Updated message" });

      expect(res.status).toBe(200);
      expect(res.body.data.message).toBe("Updated message");
    });

    it("should forbid another user from updating comment", async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}`)
        .set("Authorization", `Bearer ${employee2Token}`)
        .send({ message: "Malicious update" });

      expect(res.status).toBe(403);
    });

    it("should allow Admin to delete comment", async () => {
      const res = await request(app)
        .delete(`/api/v1/comments/${comment._id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);

      const dbComment = await Comment.findById(comment._id);
      expect(dbComment?.deletedAt).toBeInstanceOf(Date);
    });

    it("should allow updating read status", async () => {
      const res = await request(app)
        .patch(`/api/v1/comments/${comment._id}/read`)
        .set("Authorization", `Bearer ${agentToken}`)
        .send({ isRead: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isRead).toBe(true);
    });
  });
});

