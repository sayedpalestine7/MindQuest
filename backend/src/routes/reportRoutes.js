import express from "express";
import {
  createReport,
  getReportedReviews,
  checkUserReport,
  deleteReportedReview,
  dismissReports,
} from "../controllers/reportController.js";
import { protect, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Create a report (students and teachers, authenticated)
router.post("/", protect, requireRole(["student", "teacher"]), createReport);

// Check if user has reported a review
router.get("/check/:reviewId", protect, checkUserReport);

// Get all reported reviews (admin - protected but no strict role check for compatibility)
router.get("/", protect, getReportedReviews);

// Delete a reported review and all its reports (admin - protected but no strict role check for compatibility)
router.delete("/review/:reviewId", protect, deleteReportedReview);

// Dismiss reports for a review (admin - protected but no strict role check for compatibility)
router.patch("/dismiss/:reviewId", protect, dismissReports);

export default router;
