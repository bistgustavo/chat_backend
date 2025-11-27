import { Router } from "express";
import {
  sendMessage,
  getMessages,
  getAllConversations,
} from "../controllers/message.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Protected routes
router.route("/send").post(authenticate, sendMessage);
router.route("/:userId").get(authenticate, getMessages);
router.route("/").get(authenticate, getAllConversations);

export default router;

