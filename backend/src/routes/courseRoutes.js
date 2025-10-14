import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only teachers can create or edit courses
router.post("/", protect, requireRole(["teacher", "admin"]), createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.put("/:id", protect, requireRole(["teacher", "admin"]), updateCourse);
router.delete("/:id", protect, requireRole(["teacher", "admin"]), deleteCourse);

export default router;
