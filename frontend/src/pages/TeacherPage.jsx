import React, { useState } from "react";
import { useParams } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import TeacherHeader from "../components/profiles/treacherInfo/TeacherHeader";
import ExpertiseTags from "../components/profiles/treacherInfo/ExpertiseTags";
import CoursesList from "../components/profiles/treacherInfo/CoursesList";
import ReviewsList from "../components/profiles/treacherInfo/ReviewsList";
import Header from "../components/profiles/treacherInfo/Header";

const teachersData = {
  "Sarah Mitchell": {
    name: "Sayed Qutob",
    totalStudents: 12450,
    expertise: ["HTML", "CSS", "JavaScript"],
    courses: [
      {
        id: 1,
        title: "Introduction to Web Development",
        category: "Web Development",
        duration: "6h 30m",
        lessons: 24,
        difficulty: "beginner",
        thumbnail: "/images/webdev.jpg",
      },
      {
        id: 3,
        title: "React Fundamentals",
        category: "Frontend",
        duration: "5h 15m",
        lessons: 18,
        difficulty: "intermediate",
        thumbnail: "/images/react.jpg",
      },
    ],
    reviews: [
      {
        id: 1,
        student: "Student A",
        date: "Jan 12, 2025",
        rating: 5,
        comment: "Amazing teacher, very clear explanations!",
        course: "React Fundamentals",
      },
      {
        id: 2,
        student: "Student B",
        date: "Feb 8, 2025",
        rating: 4,
        comment: "Helped me understand JS deeply.",
        course: "Introduction to Web Development",
      },
    ],
  },
  "Michael Chen": {
    name: "Michael Chen",
    totalStudents: 8920,
    expertise: ["JavaScript", "ES6", "Async"],
    courses: [
      {
        id: 2,
        title: "Advanced JavaScript Concepts",
        category: "Programming",
        duration: "4h 50m",
        lessons: 20,
        difficulty: "advanced",
        thumbnail: "/images/js-advanced.jpg",
      },
    ],
    reviews: [
      {
        id: 1,
        student: "Student C",
        date: "Mar 3, 2025",
        rating: 5,
        comment: "Loved this class!",
        course: "Advanced JavaScript Concepts",
      },
    ],
  },
};

export default function TeacherPage() {
  const { instructor } = useParams();
  const teacherName = decodeURIComponent(instructor);
  const teacher = teachersData[teacherName];
  const [enrolledCourses, setEnrolledCourses] = useState([1, 2, 3, 4]);
  const [activeTab, setActiveTab] = useState("courses");

  if (!teacher) return <div>Teacher Not Found</div>;

  const handleEnroll = (id) => {
    if (!enrolledCourses.includes(id)) {
      setEnrolledCourses([...enrolledCourses, id]);
      alert("Enrolled successfully!");
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
            <TeacherHeader teacher={teacher} />
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
              <ReviewsList reviews={teacher.reviews} />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
