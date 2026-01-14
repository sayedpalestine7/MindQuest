import express from "express";
import { 
  getStudentByID, 
  putStudentByID, 
  enrollCourse, 
  getEnrolledCourses, 
  updateCourseProgress,
  getCourseProgress,
  resetCourseProgress
} from "../controllers/studentController.js";

const router = express.Router();

// Get student by MongoDB _id
router.get("/id/:id", getStudentByID);

// Update student by _id
router.put("/id/:id", putStudentByID);

// Enroll in a course
router.post("/:studentId/enroll/:courseId", enrollCourse);

// Get enrolled courses
router.get("/:studentId/courses", getEnrolledCourses);

// Get course progress
router.get("/:studentId/progress/:courseId", getCourseProgress);

// Update course progress
router.put("/:studentId/progress/:courseId", updateCourseProgress);

// Reset course progress
router.delete("/:studentId/progress/:courseId", resetCourseProgress);

export default router;
