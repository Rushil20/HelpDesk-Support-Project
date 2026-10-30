"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ticket_controller_1 = require("../controllers/ticket.controller");
const comment_controller_1 = require("../controllers/comment.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const ticket_validator_1 = require("../validators/ticket.validator");
const comment_validator_1 = require("../validators/comment.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const constants_1 = require("../config/constants");
const router = (0, express_1.Router)();
// All ticket routes require authentication
router.use(auth_middleware_1.authenticate);
router.post("/", (0, validation_middleware_1.validateRequest)(ticket_validator_1.createTicketSchema), ticket_controller_1.TicketController.createTicket);
router.get("/", (0, validation_middleware_1.validateRequest)(ticket_validator_1.listTicketsQuerySchema), ticket_controller_1.TicketController.listTickets);
router.get("/:id", (0, validation_middleware_1.validateRequest)(ticket_validator_1.ticketIdParamSchema), ticket_controller_1.TicketController.getTicketById);
router.patch("/:id", (0, validation_middleware_1.validateRequest)(ticket_validator_1.updateTicketSchema), ticket_controller_1.TicketController.updateTicket);
router.delete("/:id", (0, validation_middleware_1.validateRequest)(ticket_validator_1.ticketIdParamSchema), ticket_controller_1.TicketController.deleteTicket);
router.patch("/:id/assign", (0, role_middleware_1.requireRole)(constants_1.UserRole.AGENT, constants_1.UserRole.ADMIN), (0, validation_middleware_1.validateRequest)(ticket_validator_1.assignTicketSchema), ticket_controller_1.TicketController.assignTicket);
router.patch("/:id/status", (0, validation_middleware_1.validateRequest)(ticket_validator_1.updateTicketStatusSchema), ticket_controller_1.TicketController.updateStatus);
router.patch("/:id/priority", (0, role_middleware_1.requireRole)(constants_1.UserRole.AGENT, constants_1.UserRole.ADMIN), (0, validation_middleware_1.validateRequest)(ticket_validator_1.updateTicketPrioritySchema), ticket_controller_1.TicketController.updatePriority);
// Nested comment endpoints under /tickets/:id/comments
router.post("/:id/comments", (0, validation_middleware_1.validateRequest)(comment_validator_1.createCommentSchema), comment_controller_1.CommentController.createComment);
router.get("/:id/comments", (0, validation_middleware_1.validateRequest)(comment_validator_1.listCommentsQuerySchema), comment_controller_1.CommentController.listComments);
exports.default = router;
