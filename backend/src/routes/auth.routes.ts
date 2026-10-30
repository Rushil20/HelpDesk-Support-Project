import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validateRequest } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);
router.post("/login", validateRequest(loginSchema), AuthController.login);
router.get("/me", authenticate, AuthController.getCurrentUser);

export default router;

