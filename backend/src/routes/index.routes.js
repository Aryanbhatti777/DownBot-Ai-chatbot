import { Router } from "express";
import authRoutes from "./auth.routes.js";

const router = Router();

/** Mounts versioned API feature routes. */
router.use("/auth", authRoutes);

export default router;
