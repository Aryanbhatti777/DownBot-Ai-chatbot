import { Router } from "express";
import { login, logout, me, refresh, register } from "../controller/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate, loginValidator, registerValidator } from "../validators/auth.validator.js";

const router = Router();

/** Declares registration, login, token refresh, logout, and profile routes. */
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", requireAuth, me);

export default router;
