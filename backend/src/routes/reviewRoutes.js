import express from "express";
import {
  createReview,
  getReviewsByCourse,
  getStudentReviewForCourse,
  deleteReview,
} from "../controllers/reviewController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new review (student only)
router.post("/", protect, requireRole(["student"]), createReview);

// Get all reviews for a course (public)
router.get("/course/:courseId", getReviewsByCourse);

// Get a specific student's review for a course
router.get("/student/:studentId/course/:courseId", getStudentReviewForCourse);

// Delete a review (student can only delete their own)
router.delete("/:reviewId", protect, requireRole(["student"]), deleteReview);

export default router;
