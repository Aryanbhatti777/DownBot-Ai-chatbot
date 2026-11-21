import { Router } from "express";
import authRoutes from "./auth.routes.js";
import conversationRouter from './conversation.routes.js'

const router = Router();

/** Mounts versioned API feature routes. */
router.use("/auth", authRoutes);
router.use("/conversation", conversationRouter)

export default router;
