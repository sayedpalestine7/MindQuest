import express from "express";
import {
  createReview,
  getReviewsByCourse,
  getStudentReviewForCourse,
  deleteReview,
  getReviewsByTeacher,
  getFeaturedReviews,
} from "../controllers/reviewController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a new review (student only)
router.post("/", protect, requireRole(["student"]), createReview);

// Get featured reviews for homepage (public)
router.get("/featured", getFeaturedReviews);

// Get all reviews for a course (public)
router.get("/course/:courseId", getReviewsByCourse);

// Get all reviews for a teacher's courses (public - for teacher profile page)
router.get("/teacher/:teacherId", getReviewsByTeacher);

// Get a specific student's review for a course
router.get("/student/:studentId/course/:courseId", getStudentReviewForCourse);

// Delete a review (student can only delete their own)
router.delete("/:reviewId", protect, requireRole(["student"]), deleteReview);

export default router;
