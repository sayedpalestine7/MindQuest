import express from "express";
import {
  saveProgress,
  getProgressByStudent,
  markLessonCompleted,
  markQuizCompleted,
} from "../controllers/progressController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Manual full update
router.post("/", protect, requireRole(["student", "teacher", "admin"]), saveProgress);

// Auto-updates
router.post("/lessonCompleted", protect, requireRole(["student", "teacher", "admin"]), markLessonCompleted);
router.post("/quizCompleted", protect, requireRole(["student", "teacher", "admin"]), markQuizCompleted);

// Fetch student progress
router.get("/student/:studentId", protect, requireRole(["teacher", "admin", "student"]), getProgressByStudent);

export default router;
