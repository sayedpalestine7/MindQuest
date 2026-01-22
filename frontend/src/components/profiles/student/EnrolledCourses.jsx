import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import RatingModal from "./RatingModal";

export default function EnrolledCourses({ courses }) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState({}); // { courseId: review }
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const studentId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Fetch existing reviews for enrolled courses
  useEffect(() => {
    const fetchReviews = async () => {
      if (!studentId || courses.length === 0) return;

      try {
        const reviewPromises = courses.map((course) =>
          axios
            .get(`http://localhost:5000/api/reviews/student/${studentId}/course/${course._id}`)
            .then((res) => ({ courseId: course._id, review: res.data }))
            .catch(() => ({ courseId: course._id, review: null }))
        );

        const results = await Promise.all(reviewPromises);
        const reviewMap = {};
        results.forEach(({ courseId, review }) => {
          if (review) reviewMap[courseId] = review;
        });
        setReviews(reviewMap);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    fetchReviews();
  }, [studentId, courses]);

  const handleContinueCourse = (courseId) => {
    navigate(`/student/coursePage/${courseId}`);
  };

  const handleRateClick = (course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleReviewSuccess = (review) => {
    setReviews((prev) => ({ ...prev, [review.courseId]: review }));
    toast.success("Review submitted successfully!");
  };

  const handleDeleteReview = async (reviewId, courseId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete review");
        return;
      }

      await axios.delete(`http://localhost:5000/api/reviews/${reviewId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setReviews((prev) => {
        const updated = { ...prev };
        delete updated[courseId];
        return updated;
      });
      toast.success("Review deleted successfully!");
    } catch (err) {
      console.error("Error deleting review:", err);
      toast.error(err.response?.data?.message || "Failed to delete review");
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {courses.map((course, i) => {
          const review = reviews[course._id];
          const totalLessons = course.totalLessons || course.lessonIds?.length || 0;
          const completedLessons = Math.min(course.completedLessons || 0, totalLessons);
          const progress = totalLessons > 0
            ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
            : 0;

          return (
            <motion.div
              key={course._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03, y: -2 }}
              className="mq-card mq-card-hover overflow-hidden cursor-pointer"
            >
              {course.thumbnail ? (
                <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
              ) : (
                <div className="w-full h-40 flex items-center justify-center bg-slate-100">
                  <span className="text-5xl text-slate-400">📚</span>
                </div>
              )}

              <div className="p-4">
                <h4 className="font-semibold mb-2 text-base line-clamp-2 text-slate-800">
                  {course.title}
                </h4>
                <p className="text-xs mb-3 text-slate-500">
                  {completedLessons} / {totalLessons} lessons completed
                </p>

                <div className="w-full h-2 rounded-full mb-3 bg-slate-200">
                  <motion.div
                    className="h-2 rounded-full bg-blue-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                  />
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-blue-600">
                    {progress}% Complete
                  </span>
                </div>

                <div className="buttons flex h-10 gap-2">
                  <button
                    onClick={() => handleContinueCourse(course._id)}
                    className="mq-btn-primary w-full py-2 text-sm"
                  >
                    Continue
                  </button>

                  {!review ? (
                    <button
                      onClick={() => handleRateClick(course)}
                      className="mq-btn-outline w-2/12 py-2 text-xs"
                    >
                      Rate
                    </button>
                  ) : (
                    <div className="w-2/12 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, idx) => (
                          <svg
                            key={idx}
                            xmlns="http://www.w3.org/2000/svg"
                            className={`h-3 w-3 ${
                              idx < review.rating
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
                      <button
                        onClick={() => handleDeleteReview(review._id, course._id)}
                        className="text-xs text-red-500 hover:text-red-700 mt-1 font-medium"
                        title="Delete review"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Rating Modal */}
      {selectedCourse && (
        <RatingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
          courseId={selectedCourse._id}
          courseName={selectedCourse.title}
          studentId={studentId}
          onSuccess={handleReviewSuccess}
        />
      )}
    </>
  );
}
