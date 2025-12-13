"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import axios from "axios"
import Header from "../components/courseBrowse/Header.jsx"
import SearchFilters from "../components/courseBrowse/SearchFilters.jsx"
import CourseCard from "../components/courseBrowse/CourseCard.jsx"
import courseService from "../services/courseService"

const difficultyMap = {
  "All Levels": "all",
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
}

export default function BrowseCoursesPage() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [studentId, setStudentId] = useState(null)

  // ✅ Get student ID from auth on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      setStudentId(userId)
    }
  }, [])

  // ✅ Fetch courses from backend
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/courses")
        setCourses(data)
      } catch (err) {
        console.error("Error fetching courses:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [])

  // ✅ Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!studentId) return
      try {
        const result = await courseService.getEnrolledCourses(studentId)
        if (result.success && result.data) {
          const enrolledIds = result.data.map(c => c._id)
          setEnrolledCourses(enrolledIds)
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err)
      }
    }
    fetchEnrolledCourses()
  }, [studentId])

  const categories = [
    "all",
    "Web Development",
    "Programming",
    "Data Science",
    "Design",
    "Backend",
    "Mobile Development",
  ]

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === "all" || course.category === selectedCategory

    const difficultyValue = difficultyMap[selectedDifficulty] || "all"
    const matchesDifficulty =
      difficultyValue === "all" || course.difficulty === difficultyValue

    return matchesSearch && matchesCategory && matchesDifficulty
  })

  // ✅ Handle enroll - now calls backend API
  const handleEnroll = async (courseId) => {
    if (!studentId) {
      alert("Please log in first")
      return
    }

    if (enrolledCourses.includes(courseId)) {
      alert("You are already enrolled in this course!")
      return
    }

    try {
      // Call backend API to enroll student
      const result = await courseService.enrollCourse(studentId, courseId)
      if (result.success) {
        // Update local enrolled courses state
        setEnrolledCourses([...enrolledCourses, courseId])
        alert("Successfully enrolled! Navigating to course...")
        // Navigate to the course page
        navigate(`/student/coursePage/${courseId}`)
      } else {
        alert(result.error || "Failed to enroll in course")
      }
    } catch (err) {
      console.error("Enrollment error:", err)
      alert("Error enrolling in course")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* 🧠 Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold mb-3">Explore Our Courses</h2>
          <p className="text-lg text-gray-600">
            Discover new skills and advance your career with our comprehensive course catalog.
          </p>
        </motion.div>

        {/* 🎯 Search + Filters */}
        <SearchFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          categories={categories}
        />

        {/* 🔢 Course Count */}
        <p className="text-gray-600 mt-6 mb-4">
          Showing{" "}
          <span className="font-semibold text-gray-900">{filteredCourses.length}</span> courses
        </p>

        {/* 🧩 Course Grid */}
        {loading ? (
          <div className="flex justify-center py-16 text-gray-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <h3 className="text-xl font-bold mb-2">No courses found</h3>
            <p>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, index) => (
              <CourseCard
                key={course._id}
                course={{
                  id: course._id,
                  title: course.title,
                  description: course.description,
                  thumbnail:
                    course.thumbnail ||
                    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1170&q=80",
                  instructor: course.teacherId?.name || "Unknown Instructor",
                  teacherId: course.teacherId?._id,
                  rating: 4.7,
                  students: Math.floor(Math.random() * 15000) + 1000,
                  duration: "8 weeks",
                  lessons: course.lessonIds?.length || 10,
                  difficulty: course.difficulty,
                  category: course.category || "Programming",
                  price: course.price || "Free",
                  tags: ["Learning", "Education"],
                }}
                index={index}
                enrolledCourses={enrolledCourses}
                handleEnroll={handleEnroll}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
