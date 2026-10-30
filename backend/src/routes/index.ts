import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import ticketRoutes from "./ticket.routes";
import commentRoutes from "./comment.routes";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tickets", ticketRoutes);
router.use("/comments", commentRoutes);

export default router;

