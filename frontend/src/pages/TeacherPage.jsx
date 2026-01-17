import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";
import TeacherHeader from "../components/profiles/treacherInfo/TeacherHeader";
import ExpertiseTags from "../components/profiles/treacherInfo/ExpertiseTags";
import CoursesList from "../components/profiles/treacherInfo/CoursesList";
import ReviewsList from "../components/profiles/treacherInfo/ReviewsList";
import Header from "../components/profiles/treacherInfo/Header";

export default function TeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Get student ID from auth or localStorage
  useEffect(() => {
    const userId = user?.id || localStorage.getItem("userId");
    if (userId) {
      setStudentId(userId);
    }
  }, [user]);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`http://localhost:5000/api/teacher/id/${id}`);
        const data = res.data || {};

        // Calculate total students by summing students from all courses
        // Same student in multiple courses is counted multiple times
        const courses = data.courses || [];
        const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);

        // Normalize course IDs: ensure each course has an 'id' property from '_id'
        const normalizedCourses = courses.map(course => ({
          ...course,
          id: course._id || course.id,
        }));

        const mappedTeacher = {
          ...data,
          // ensure arrays for components
          courses: normalizedCourses,
          expertise: data.expertise || (data.specialization ? [data.specialization] : []),
          totalStudents: totalStudents,
          rating: data.rating || 0,
        };

        setTeacher(mappedTeacher);
      } catch (err) {
        console.error("Error fetching teacher:", err);
        setError(err.response?.data?.message || "Failed to load teacher");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTeacher();
  }, [id]);

  // Fetch enrolled courses for the student
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!studentId) return;
      try {
        const result = await courseService.getEnrolledCourses(studentId);
        if (result.success && result.data) {
          const enrolledIds = result.data.map(c => c._id);
          setEnrolledCourses(enrolledIds);
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
      }
    };
    fetchEnrolledCourses();
  }, [studentId]);

  // Fetch reviews for the teacher
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        setReviewsLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get(
          `http://localhost:5000/api/reviews/teacher/${id}`,
          { headers }
        );
        setReviews(res.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !teacher) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Teacher Not Found"}</div>;

  const handleEnroll = async (courseId) => {
    if (!studentId) {
      alert("Please log in first");
      return;
    }

    if (enrolledCourses.includes(courseId)) {
      alert("You are already enrolled in this course!");
      return;
    }

    try {
      // Call backend API to enroll student
      const result = await courseService.enrollCourse(studentId, courseId);
      if (result.success) {
        // Update local enrolled courses state
        setEnrolledCourses([...enrolledCourses, courseId]);
        alert("Successfully enrolled! Navigating to course...");
        // Navigate to the course page
        navigate(`/student/coursePage/${courseId}`);
      } else {
        alert(result.error || "Failed to enroll in course");
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      alert("Error enrolling in course");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Profile Header */}
        <Header />

        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <div className="bg-white rounded-xl shadow p-6 gap-6">
            <TeacherHeader teacher={teacher} reviewsCount={reviews.length} />
            <div className="mt-6 pt-6 border-t border-border">
              <ExpertiseTags skills={teacher.expertise} />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-300 mb-6">
            <button
              className={`px-6 py-2 font-medium ${activeTab === "courses"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("courses")}
            >
              Courses
            </button>
            <button
              className={`px-6 py-2 font-medium ${activeTab === "reviews"
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
                }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
          </div>

          {/* Animated Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "courses" && (
              <CoursesList
                courses={teacher.courses}
                enrolledCourses={enrolledCourses}
                handleEnroll={handleEnroll}
              />
            )}

            {activeTab === "reviews" && (
              <ReviewsList reviews={reviews} loading={reviewsLoading} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
