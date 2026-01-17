import Review from "../models/mongo/reviewModel.js";
import Course from "../models/mongo/courseModel.js";

// Create a new review
export const createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;
    const studentId = req.user._id;

    // Validate required fields
    if (!courseId || !rating) {
      return res.status(400).json({ message: "Course ID and rating are required" });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if student is enrolled in the course
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // Check if student already reviewed this course
    const existingReview = await Review.findOne({ courseId, studentId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this course" });
    }

    // Create the review
    const review = new Review({
      courseId,
      studentId,
      rating,
      comment: comment || "",
    });

    await review.save();

    // Update course average rating
    await updateCourseRating(courseId);

    res.status(201).json({
      message: "Review created successfully",
      review,
    });
  } catch (err) {
    console.error("Error creating review:", err);
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
};

// Get all reviews for a course
export const getReviewsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const reviews = await Review.find({ courseId })
      .populate("studentId", "name profileImage")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (err) {
    console.error("Error fetching reviews:", err);
    res.status(500).json({ message: "Failed to fetch reviews", error: err.message });
  }
};

// Get a specific student's review for a course
export const getStudentReviewForCourse = async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const review = await Review.findOne({ courseId, studentId })
      .populate("studentId", "name profileImage");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.status(200).json(review);
  } catch (err) {
    console.error("Error fetching review:", err);
    res.status(500).json({ message: "Failed to fetch review", error: err.message });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const studentId = req.user._id;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Ensure student can only delete their own review
    if (review.studentId.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "You can only delete your own reviews" });
    }

    const courseId = review.courseId;
    await Review.findByIdAndDelete(reviewId);

    // Update course average rating
    await updateCourseRating(courseId);

    res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    console.error("Error deleting review:", err);
    res.status(500).json({ message: "Failed to delete review", error: err.message });
  }
};

// Helper function to update course average rating
async function updateCourseRating(courseId) {
  try {
    const reviews = await Review.find({ courseId });

    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = totalRating / reviews.length;
      // Round to 1 decimal place
      averageRating = Math.round(averageRating * 10) / 10;
    }

    await Course.findByIdAndUpdate(courseId, { rating: averageRating });
  } catch (err) {
    console.error("Error updating course rating:", err);
  }
}
