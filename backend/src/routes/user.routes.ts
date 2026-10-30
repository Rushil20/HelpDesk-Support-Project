import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import {
  createUserSchema,
  updateUserSchema,
  changeUserRoleSchema,
  listUsersQuerySchema,
  userIdParamSchema,
} from "../validators/user.validator";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { UserRole } from "../config/constants";

const router = Router();

// All user management routes require authentication and Administrator role
router.use(authenticate, requireRole(UserRole.ADMIN));

router.post("/", validateRequest(createUserSchema), UserController.createUser);
router.get("/", validateRequest(listUsersQuerySchema), UserController.listUsers);
router.get("/:id", validateRequest(userIdParamSchema), UserController.getUserById);
router.patch("/:id", validateRequest(updateUserSchema), UserController.updateUser);
router.delete("/:id", validateRequest(userIdParamSchema), UserController.deactivateUser);
router.patch("/:id/role", validateRequest(changeUserRoleSchema), UserController.changeUserRole);

export default router;

