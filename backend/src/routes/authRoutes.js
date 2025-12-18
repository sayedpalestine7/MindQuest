import express from "express";
import { registerUser, loginUser , googleAuth } from "../controllers/authController.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// For normal users
router.post("/register", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);

// ✅ New teacher signup route with two files: profile image + certification
router.post(
  "/register-teacher",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "certification", maxCount: 1 },
  ]),
  registerUser
);

// Google Auth (signin + signup)
router.post("/google", googleAuth);

export default router;
