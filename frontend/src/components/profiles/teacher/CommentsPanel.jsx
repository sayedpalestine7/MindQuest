import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { MoreVertical } from "lucide-react";
import ReportModal from "../../shared/ReportModal";

/**
 * CommentsPanel - Displays all reviews/comments for teacher's courses
 * Shows student name, rating, comment, and course name
 */
export default function CommentsPanel({ teacherId }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [showMenu, setShowMenu] = useState(null); // Track which review menu is open
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [reportedReviews, setReportedReviews] = useState({}); // Track reported status
  const menuRefs = useRef({});

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

  const handleReportSuccess = (reviewId) => {
    setReportedReviews(prev => ({ ...prev, [reviewId]: true }));
    setShowMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && menuRefs.current[showMenu] && !menuRefs.current[showMenu].contains(event.target)) {
        setShowMenu(null);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  // Check reported status for reviews
  useEffect(() => {
    const checkReportedStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || reviews.length === 0) return;

      const statusMap = {};
      for (const review of reviews) {
        try {
          const res = await axios.get(
            `http://localhost:5000/api/reports/check/${review._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          statusMap[review._id] = res.data.hasReported;
        } catch (err) {
          statusMap[review._id] = false;
        }
      }
      setReportedReviews(statusMap);
    };

    checkReportedStatus();
  }, [reviews]);

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
            className={`h-4 w-4 ${star <= rating
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
    <div className="p-4 h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Course Reviews
          </h2>
          {courses.length > 0 && (
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white hover:border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors shadow-sm"
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
        <p className="text-xs text-slate-500 mt-2">
          {filteredReviews.length} review{filteredReviews.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 borde-blue-600"></div>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center text-slate-400">
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
                className="mq-card p-3 shadow-sm "
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
                        <h4 className="font-semibold text-sm text-slate-800">
                          {review.studentId?.name || "Anonymous"}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {review.courseId?.title || "Unknown Course"}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-end">
                          {renderStars(review.rating)}
                          <span className="text-xs mt-1 text-slate-400">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Three-dot menu */}
                        <div className="relative" ref={(el) => menuRefs.current[review._id] = el}>
                          <button
                            onClick={() => setShowMenu(showMenu === review._id ? null : review._id)}
                            className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>

                          {/* Dropdown Menu */}
                          {showMenu === review._id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                              <button
                                onClick={() => {
                                  setSelectedReviewId(review._id);
                                  setIsReportModalOpen(true);
                                  setShowMenu(null);
                                }}
                                disabled={reportedReviews[review._id]}
                                className={`w-full text-left px-4 py-2 text-sm transition-colors ${reportedReviews[review._id]
                                    ? "text-gray-400 cursor-not-allowed"
                                    : "text-red-600 hover:bg-red-50"
                                  }`}
                              >
                                {reportedReviews[review._id] ? "Already Reported" : "Report"}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm mt-2 pl-13 text-slate-600">
                    {review.comment}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Stats Footer removed - stats shown in StatsPanel */}

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reviewId={selectedReviewId}
        onSuccess={() => handleReportSuccess(selectedReviewId)}
      />
    </div>
  );
}
