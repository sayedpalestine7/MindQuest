import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  generateQuiz,
  importQuestions,
  togglePublishCourse,
  submitCourseForReview,
  approveCourse,
  rejectCourse,
  getCourseCategories,
} from "../controllers/courseController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only teachers can create or edit courses
router.post("/", protect, requireRole(["teacher", "admin"]), createCourse);
// AI: generate quiz for a course (protected)
router.post("/:id/generate-quiz", protect, requireRole(["teacher", "admin"]), generateQuiz);
// Import questions generated externally (n8n webhook)
router.post("/:id/import-questions", protect, requireRole(["teacher", "admin"]), importQuestions);

// Course approval workflow
router.patch("/:courseId/submit", protect, requireRole(["teacher", "admin"]), submitCourseForReview);
router.patch("/:courseId/approve", protect, approveCourse); // TODO: Re-enable requireRole(["teacher", "admin"]) after testing
router.patch("/:courseId/reject", protect, rejectCourse); // TODO: Re-enable requireRole(["teacher", "admin"]) after testing

// Toggle publish status (admin only - kept for backward compatibility)
router.patch("/:courseId/publish", protect, requireRole(["admin"]), togglePublishCourse);

router.get("/", getCourses);
router.get("/categories", getCourseCategories);
router.get("/:id", getCourseById);
router.put("/:id", protect, requireRole(["teacher", "admin"]), updateCourse);
router.delete("/:id", protect, requireRole(["teacher", "admin"]), deleteCourse);

export default router;
