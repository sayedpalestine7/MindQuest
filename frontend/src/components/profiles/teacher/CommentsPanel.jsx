import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * CommentsPanel - Displays all reviews/comments for teacher's courses
 * Shows student name, rating, comment, and course name
 */
export default function CommentsPanel({ teacherId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");

  useEffect(() => {
    const fetchReviews = async () => {
      if (!teacherId) return;

      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setReviews([]);
          setLoading(false);
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/reviews/teacher/${teacherId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setReviews(response.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        if (err.response?.status !== 404) {
          toast.error("Failed to load reviews");
        }
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [teacherId]);

  // Get unique courses for filtering
  const courses = Array.from(
    new Set(reviews.map((r) => r.courseId?.title).filter(Boolean))
  );

  // Filter reviews by selected course
  const filteredReviews =
    selectedCourse === "all"
      ? reviews
      : reviews.filter((r) => r.courseId?.title === selectedCourse);

  const renderStars = (rating) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 ${
              star <= rating
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
        ))}
      </div>
    );
  };

  return (
    <div
      className="rounded-lg shadow-sm p-4 h-full flex flex-col"
      style={{
        backgroundColor: "#FFFFFF",
        borderColor: "#E0E0E0",
        borderWidth: "1px",
        borderStyle: "solid",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold" style={{ color: "#263238" }}>
          Course Reviews
        </h2>
        {courses.length > 0 && (
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1 text-sm border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            style={{ borderColor: "#E0E0E0" }}
          >
            <option value="all">All Courses ({reviews.length})</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course} (
                {reviews.filter((r) => r.courseId?.title === course).length})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 text-center"
            style={{ color: "#9E9E9E" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-sm font-medium">No reviews yet</p>
            <p className="text-xs mt-1">
              Students can rate your courses after enrollment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredReviews.map((review, index) => (
              <motion.div
                key={review._id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-3 rounded-lg border"
                style={{
                  backgroundColor: "#F5F7FA",
                  borderColor: "#E0E0E0",
                }}
              >
                {/* Student & Course Info */}
                <div className="flex items-start gap-3 mb-2">
                  <img
                    src={
                      review.studentId?.profileImage ||
                      "https://via.placeholder.com/40"
                    }
                    alt={review.studentId?.name || "Student"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4
                          className="font-semibold text-sm"
                          style={{ color: "#263238" }}
                        >
                          {review.studentId?.name || "Anonymous"}
                        </h4>
                        <p
                          className="text-xs"
                          style={{ color: "#607D8B" }}
                        >
                          {review.courseId?.title || "Unknown Course"}
                        </p>
                      </div>
                      <div className="flex flex-col items-end">
                        {renderStars(review.rating)}
                        <span
                          className="text-xs mt-1"
                          style={{ color: "#9E9E9E" }}
                        >
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p
                    className="text-sm mt-2 pl-13"
                    style={{ color: "#455A64" }}
                  >
                    {review.comment}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      {filteredReviews.length > 0 && (
        <div
          className="mt-4 pt-3 border-t flex items-center justify-between"
          style={{ borderColor: "#E0E0E0" }}
        >
          <div className="text-sm" style={{ color: "#607D8B" }}>
            <span className="font-semibold" style={{ color: "#263238" }}>
              {filteredReviews.length}
            </span>{" "}
            {filteredReviews.length === 1 ? "review" : "reviews"}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm" style={{ color: "#607D8B" }}>
              Average:
            </span>
            <div className="flex items-center gap-1">
              {renderStars(
                Math.round(
                  filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
                    filteredReviews.length
                )
              )}
              <span
                className="text-sm font-semibold ml-1"
                style={{ color: "#263238" }}
              >
                {(
                  filteredReviews.reduce((sum, r) => sum + r.rating, 0) /
                  filteredReviews.length
                ).toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
