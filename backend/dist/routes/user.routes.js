"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const validation_middleware_1 = require("../middlewares/validation.middleware");
const user_validator_1 = require("../validators/user.validator");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const role_middleware_1 = require("../middlewares/role.middleware");
const constants_1 = require("../config/constants");
const router = (0, express_1.Router)();
// All user management routes require authentication and Administrator role
router.use(auth_middleware_1.authenticate, (0, role_middleware_1.requireRole)(constants_1.UserRole.ADMIN));
router.post("/", (0, validation_middleware_1.validateRequest)(user_validator_1.createUserSchema), user_controller_1.UserController.createUser);
router.get("/", (0, validation_middleware_1.validateRequest)(user_validator_1.listUsersQuerySchema), user_controller_1.UserController.listUsers);
router.get("/:id", (0, validation_middleware_1.validateRequest)(user_validator_1.userIdParamSchema), user_controller_1.UserController.getUserById);
router.patch("/:id", (0, validation_middleware_1.validateRequest)(user_validator_1.updateUserSchema), user_controller_1.UserController.updateUser);
router.delete("/:id", (0, validation_middleware_1.validateRequest)(user_validator_1.userIdParamSchema), user_controller_1.UserController.deactivateUser);
router.patch("/:id/role", (0, validation_middleware_1.validateRequest)(user_validator_1.changeUserRoleSchema), user_controller_1.UserController.changeUserRole);
exports.default = router;
