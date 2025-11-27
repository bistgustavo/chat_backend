import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getUsers,
  getStats,
} from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// Public routes
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// Protected routes
router.route("/logout").post(authenticate, logoutUser);
router.route("/all").get(authenticate, getUsers);
router.route("/stats").get(authenticate, getStats);

export default router;
