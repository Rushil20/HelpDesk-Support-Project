"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("./auth.routes"));
const user_routes_1 = __importDefault(require("./user.routes"));
const ticket_routes_1 = __importDefault(require("./ticket.routes"));
const comment_routes_1 = __importDefault(require("./comment.routes"));
const router = (0, express_1.Router)();
router.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
router.use("/auth", auth_routes_1.default);
router.use("/users", user_routes_1.default);
router.use("/tickets", ticket_routes_1.default);
router.use("/comments", comment_routes_1.default);
exports.default = router;
