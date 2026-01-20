import ReviewReport from "../models/mongo/reviewReportModel.js";
import Review from "../models/mongo/reviewModel.js";
import Course from "../models/mongo/courseModel.js";
import { createNotification } from "../services/notificationService.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { reviewId, reason, additionalInfo } = req.body;
    const reporterId = req.user._id;

    // Validate required fields
    if (!reviewId || !reason) {
      return res.status(400).json({ message: "Review ID and reason are required" });
    }

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Prevent self-reporting
    if (review.studentId.toString() === reporterId.toString()) {
      return res.status(400).json({ message: "You cannot report your own review" });
    }

    // Check for duplicate report
    const existingReport = await ReviewReport.findOne({ reviewId, reporterId });
    if (existingReport) {
      return res.status(400).json({ message: "You have already reported this review" });
    }

    // Create the report
    const report = new ReviewReport({
      reviewId,
      reporterId,
      reason,
      additionalInfo: additionalInfo || "",
    });

    await report.save();

    res.status(201).json({
      message: "Report submitted successfully",
      report,
    });
  } catch (err) {
    console.error("Error creating report:", err);
    res.status(500).json({ message: "Failed to create report", error: err.message });
  }
};

// Get all reported reviews (Admin only)
export const getReportedReviews = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    // Aggregate reports by reviewId with count
    const reportedReviews = await ReviewReport.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$reviewId",
          reportCount: { $sum: 1 },
          reasons: { $push: "$reason" },
          latestReportDate: { $max: "$createdAt" },
          reports: { $push: "$$ROOT" },
        },
      },
      { $sort: { reportCount: -1, latestReportDate: -1 } },
    ]);

    // Populate review, student, and course details
    const populatedReports = await Review.populate(reportedReviews, [
      { path: "_id", select: "rating comment courseId studentId createdAt" },
    ]);

    const enrichedReports = await Promise.all(
      populatedReports.map(async (report) => {
        const review = report._id;
        if (!review) return null;

        // Populate student and course
        await review.populate("studentId", "name email profileImage");
        await review.populate("courseId", "title thumbnail");

        return {
          reviewId: review._id,
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt,
          student: review.studentId,
          course: review.courseId,
          reportCount: report.reportCount,
          reasons: report.reasons,
          latestReportDate: report.latestReportDate,
          reports: report.reports,
        };
      })
    );

    // Filter out null values
    const validReports = enrichedReports.filter((r) => r !== null);

    res.status(200).json(validReports);
  } catch (err) {
    console.error("Error fetching reported reviews:", err);
    res.status(500).json({ message: "Failed to fetch reported reviews", error: err.message });
  }
};

// Check if user has reported a review
export const checkUserReport = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const reporterId = req.user._id;

    const report = await ReviewReport.findOne({ reviewId, reporterId });

    res.status(200).json({ hasReported: !!report });
  } catch (err) {
    console.error("Error checking user report:", err);
    res.status(500).json({ message: "Failed to check report", error: err.message });
  }
};

// Delete a review and all its reports (Admin only)
export const deleteReportedReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    const courseId = review.courseId;

    // Delete all reports for this review
    await ReviewReport.deleteMany({ reviewId });

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Update course rating
    await updateCourseRating(courseId);
    
    // Send notification to review author that their review was removed
    await createNotification({
      recipientId: review.studentId,
      type: "report_status",
      title: "Review Removed",
      message: "Your review was removed after being reported and reviewed by moderators.",
      entityId: reviewId,
      metadata: { status: "removed" }
    });

    res.status(200).json({ message: "Review and all related reports deleted successfully" });
  } catch (err) {
    console.error("Error deleting reported review:", err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
};

// Dismiss reports for a review (Admin only)
export const dismissReports = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const adminId = req.user._id;

    // Update all pending reports for this review
    const result = await ReviewReport.updateMany(
      { reviewId, status: "pending" },
      {
        status: "dismissed",
        resolvedAt: new Date(),
        resolvedBy: adminId,
      }
    );

    res.status(200).json({
      message: "Reports dismissed successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    console.error("Error dismissing reports:", err);
    res.status(500).json({ message: "Failed to dismiss reports", error: err.message });
  }
};

// Helper function to update course rating
async function updateCourseRating(courseId) {
  try {
    const reviews = await Review.find({ courseId });

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
      averageRating = Math.round(averageRating * 10) / 10;
    }

    await Course.findByIdAndUpdate(courseId, { rating: averageRating });
  } catch (err) {
    console.error("Error updating course rating:", err);
  }
}
