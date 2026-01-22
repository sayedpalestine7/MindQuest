import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import RatingModal from "./RatingModal";
import { BookOpen, Users, Plus, Search, Send, CheckCircle, Clock, XCircle, AlertCircle, Trash2, Star } from "lucide-react"


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
        className="overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {courses.map((course, i) => {
          const cid = course._id || course.id;
          const review = reviews[course._id];
          const totalLessons = course.totalLessons || course.lessonIds?.length || 0;
          const completedLessons = Math.min(course.completedLessons || 0, totalLessons);
          const progress = totalLessons > 0
            ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
            : 0;

          return (
            <motion.div
              key={course._id || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className="p-4 m-3 transition-all duration-200 group cursor-pointer mq-card shadow-sm"
              whileHover={{ boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
              onClick={() => handleContinueCourse(cid)}
            >

              <div className="flex justify-between items-start md:items-center gap-4">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-32 h-20 object-cover" />
                ) : (
                  <div className="w-full h-40 flex items-center justify-center bg-slate-100">
                    <span className="text-5xl text-slate-400">📚</span>
                  </div>
                )}
                <div className="flex-1">

                  <div className="con flex justify-between">
                    <div className="title">
                      <h4 className="text-lg font-bold mb-2 text-slate-800">
                        {course.title || course.name || "Untitled"}
                      </h4>
                      <p className="text-xs mb-3 text-slate-500">
                        {completedLessons} / {totalLessons} lessons completed
                      </p>
                    </div>

                    <div className="ratting">
                      <div className="flex items-center gap-3 flex-shrink-0 relative ">
                        {!review ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRateClick(course);
                            }}
                            className="mq-btn-outline py-2 px-3 text-xs flex items-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Rate
                          </button>
                        ) : (
                          <div className="flex flex-row gap-4 items-end">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, idx) => (
                                <svg
                                  key={idx}
                                  xmlns="http://www.w3.org/2000/svg"
                                  className={`h-3 w-3 ${idx < review.rating
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteReview(review._id, cid);
                              }}
                              className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 bg-red-100 px-1 py-1 rounded-full"
                              title="Delete review"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full mb-3 bg-slate-200">
                    <motion.div
                      className="h-2 rounded-full bg-blue-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-600">
                      {progress}% Complete
                    </span>
                  </div> */}
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
