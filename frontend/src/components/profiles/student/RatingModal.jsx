import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

export default function RatingModal({ isOpen, onClose, courseId, courseName, studentId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (comment.length > 500) {
      toast.error("Comment must be 500 characters or less");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to submit a review");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/api/reviews",
        {
          courseId,
          rating,
          comment: comment.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Review submitted successfully!");
      onSuccess(response.data.review);
      handleClose();
    } catch (err) {
      console.error("Error submitting review:", err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoveredRating(0);
    setComment("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">Rate Course</h2>
            <p className="text-blue-100 text-sm mt-1">{courseName}</p>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Star Rating */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Your Rating <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoveredRating(star)}
                    onMouseLeave={() => setHoveredRating(0)}
                    className="transition-all transform hover:scale-110 focus:outline-none"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoveredRating || rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {rating} {rating === 1 ? "star" : "stars"}
                  </span>
                )}
              </div>
            </div>

            {/* Comment */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Review <span className="text-gray-400">(Optional)</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this course..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {comment.length}/500 characters
                </p>
                {comment.length > 450 && (
                  <p className="text-xs text-orange-500 font-medium">
                    {500 - comment.length} characters remaining
                  </p>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || rating === 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
