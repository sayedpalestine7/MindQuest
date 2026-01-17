import React, { useState, useEffect, useRef } from "react";
import { Star, MoreVertical } from "lucide-react";
import axios from "axios";
import ReportModal from "../../shared/ReportModal";

export default function ReviewCard({ review }) {
  const [showMenu, setShowMenu] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [isOwnReview, setIsOwnReview] = useState(false);
  const menuRef = useRef(null);

  const studentName = review.studentId?.name || "Anonymous";
  const studentAvatar = review.studentId?.profileImage;
  const courseName = review.courseId?.title || "Unknown Course";
  const reviewDate = review.createdAt
    ? new Date(review.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Check if current user is the review author
  useEffect(() => {
    const currentUserId = localStorage.getItem("userId");
    if (currentUserId && review.studentId?._id) {
      setIsOwnReview(currentUserId === review.studentId._id);
    }
  }, [review.studentId]);

  // Check if user has already reported this review
  useEffect(() => {
    const checkReport = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get(
          `http://localhost:5000/api/reports/check/${review._id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setHasReported(res.data.hasReported);
      } catch (err) {
        console.error("Error checking report:", err);
      }
    };

    if (review._id) {
      checkReport();
    }
  }, [review._id]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleReportSuccess = () => {
    setHasReported(true);
    setShowMenu(false);
  };

  return (
    <>
      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-gray-100 text-gray-700 font-semibold">
            {studentAvatar ? (
              <img
                src={studentAvatar}
                alt={studentName}
                className="w-full h-full object-cover"
              />
            ) : (
              studentName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            )}
          </div>

          {/* Review Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-semibold text-gray-900">{studentName}</h4>
                <p className="text-sm text-gray-500">{reviewDate}</p>
              </div>

              <div className="flex items-center gap-2">
                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < review.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>

                {/* Three-dot menu */}
                {!isOwnReview && (
                  <div className="relative" ref={menuRef}>
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                      title="More options"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>

                    {/* Dropdown Menu */}
                    {showMenu && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                        <button
                          onClick={() => {
                            setIsReportModalOpen(true);
                            setShowMenu(false);
                          }}
                          disabled={hasReported}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            hasReported
                              ? "text-gray-400 cursor-not-allowed"
                              : "text-red-600 hover:bg-red-50"
                          }`}
                        >
                          {hasReported ? "Already Reported" : "Report"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Comment */}
            {review.comment && (
              <p className="text-gray-800 mb-2">{review.comment}</p>
            )}

            {/* Course Badge */}
            <span className="inline-block border border-gray-300 text-gray-600 text-xs px-2 py-1 rounded">
              {courseName}
            </span>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reviewId={review._id}
        onSuccess={handleReportSuccess}
      />
    </>
  );
}
