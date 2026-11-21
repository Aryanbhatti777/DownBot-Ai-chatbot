import { Router } from "express";
import { handleMessage } from "../controller/conversation.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { sendMessageValidator } from "../validators/conversation.validator.js";

const router = Router();

router.post("/", requireAuth, sendMessageValidator, validate, handleMessage);

export default router;