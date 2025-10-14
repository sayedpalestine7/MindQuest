import express from "express";
import {
  createLesson,
  getLessonsByCourse,
  getLessonById,
  updateLesson,
  deleteLesson,
} from "../controllers/lessonController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, requireRole(["teacher", "admin"]), createLesson);
router.get("/course/:courseId", getLessonsByCourse);
router.get("/:id", getLessonById);
router.put("/:id", protect, requireRole(["teacher", "admin"]), updateLesson);
router.delete("/:id", protect, requireRole(["teacher", "admin"]), deleteLesson);

export default router;
