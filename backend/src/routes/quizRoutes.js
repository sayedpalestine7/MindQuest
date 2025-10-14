import express from "express";
import { createQuiz, getQuizzesByCourse } from "../controllers/quizController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole(["teacher", "admin"]), createQuiz);
router.get("/course/:courseId", getQuizzesByCourse);

export default router;
