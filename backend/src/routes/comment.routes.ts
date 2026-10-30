import { Router } from "express";
import { CommentController } from "../controllers/comment.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  updateCommentSchema,
  updateCommentReadStatusSchema,
  commentIdParamSchema,
} from "../validators/comment.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

// All comment management routes require authentication
router.use(authenticate);

router.patch("/:id", validateRequest(updateCommentSchema), CommentController.updateComment);
router.delete("/:id", validateRequest(commentIdParamSchema), CommentController.deleteComment);
router.patch("/:id/read", validateRequest(updateCommentReadStatusSchema), CommentController.updateReadStatus);

export default router;

