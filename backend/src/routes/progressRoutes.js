import express from "express";
import { saveProgress, getProgressByStudent } from "../controllers/progressController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Students can save their own progress
router.post("/", protect, requireRole(["student", "teacher", "admin"]), saveProgress);

// Teachers/Admins can view student progress
router.get("/student/:studentId", protect, requireRole(["teacher", "admin", "student"]), getProgressByStudent);

export default router;
