import { Router } from "express";
import { TicketController } from "../controllers/ticket.controller";
import { CommentController } from "../controllers/comment.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  createTicketSchema,
  updateTicketSchema,
  assignTicketSchema,
  updateTicketStatusSchema,
  updateTicketPrioritySchema,
  listTicketsQuerySchema,
  ticketIdParamSchema,
} from "../validators/ticket.validator";
import {
  createCommentSchema,
  listCommentsQuerySchema,
} from "../validators/comment.validator";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { UserRole } from "../config/constants";

const router = Router();

// All ticket routes require authentication
router.use(authenticate);

router.post("/", validateRequest(createTicketSchema), TicketController.createTicket);
router.get("/", validateRequest(listTicketsQuerySchema), TicketController.listTickets);
router.get("/:id", validateRequest(ticketIdParamSchema), TicketController.getTicketById);
router.patch("/:id", validateRequest(updateTicketSchema), TicketController.updateTicket);
router.delete("/:id", validateRequest(ticketIdParamSchema), TicketController.deleteTicket);

router.patch(
  "/:id/assign",
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  validateRequest(assignTicketSchema),
  TicketController.assignTicket
);

router.patch(
  "/:id/status",
  validateRequest(updateTicketStatusSchema),
  TicketController.updateStatus
);

router.patch(
  "/:id/priority",
  requireRole(UserRole.AGENT, UserRole.ADMIN),
  validateRequest(updateTicketPrioritySchema),
  TicketController.updatePriority
);

// Nested comment endpoints under /tickets/:id/comments
router.post(
  "/:id/comments",
  validateRequest(createCommentSchema),
  CommentController.createComment
);

router.get(
  "/:id/comments",
  validateRequest(listCommentsQuerySchema),
  CommentController.listComments
);

export default router;

