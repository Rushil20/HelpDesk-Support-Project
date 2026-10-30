"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const comment_controller_1 = require("../controllers/comment.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const comment_validator_1 = require("../validators/comment.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// All comment management routes require authentication
router.use(auth_middleware_1.authenticate);
router.patch("/:id", (0, validation_middleware_1.validateRequest)(comment_validator_1.updateCommentSchema), comment_controller_1.CommentController.updateComment);
router.delete("/:id", (0, validation_middleware_1.validateRequest)(comment_validator_1.commentIdParamSchema), comment_controller_1.CommentController.deleteComment);
router.patch("/:id/read", (0, validation_middleware_1.validateRequest)(comment_validator_1.updateCommentReadStatusSchema), comment_controller_1.CommentController.updateReadStatus);
exports.default = router;
