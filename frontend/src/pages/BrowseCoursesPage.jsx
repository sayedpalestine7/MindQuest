"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import AppHeader from "../components/shared/AppHeader"
import SearchFilters from "../components/courseBrowse/SearchFilters.jsx"
import CourseCard from "../components/courseBrowse/CourseCard.jsx"
import CourseCardSkeleton from "../components/courseBrowse/CourseCardSkeleton.jsx"
import EmptyState from "../components/courseBrowse/EmptyState.jsx"
import ErrorState from "../components/courseBrowse/ErrorState.jsx"
import Pagination from "../components/courseBrowse/Pagination.jsx"
import courseService from "../services/courseService"
import { useDebounce } from "../hooks/useDebounce"
import { useAuth } from "../context/AuthContext.jsx"

const difficultyMap = {
  "All Levels": "all",
  Beginner: "Beginner",
  Intermediate: "Intermediate",
  Advanced: "Advanced",
}

export default function BrowseCoursesPage() {
  const navigate = useNavigate()
  const { isStudent } = useAuth()
  
  // Course data
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCourses, setTotalCourses] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  
  // Filters
  const [searchInput, setSearchInput] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All Levels")
  const [sortBy, setSortBy] = useState("newest")
  const [categories, setCategories] = useState(["all"])
  
  // Student data
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [studentId, setStudentId] = useState(null)
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500)

  // Get student ID from auth on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId")
    if (userId) {
      setStudentId(userId)
    }
  }, [])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/courses/categories")
        // Ensure 'all' is always first in the array
        const categoriesArray = Array.isArray(data) ? data : []
        if (!categoriesArray.includes('all')) {
          setCategories(['all', ...categoriesArray])
        } else {
          setCategories(categoriesArray)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
        // Fall back to default categories
        setCategories([
          "all",
          "Web Development",
          "Programming",
          "Data Science",
          "Design",
          "Backend",
          "Mobile Development",
        ])
      }
    }
    fetchCategories()
  }, [])

  // Fetch courses with pagination and filters
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true)
      setError(null)

      try {
        // Build query params
        const params = new URLSearchParams({
          page: currentPage,
          limit: 6,
          sortBy: sortBy,
        })

        if (selectedCategory !== "all") {
          params.append("category", selectedCategory)
        }

        const difficultyValue = difficultyMap[selectedDifficulty]
        if (difficultyValue !== "all") {
          params.append("difficulty", difficultyValue)
        }

        if (debouncedSearch) {
          params.append("search", debouncedSearch)
        }

        const { data } = await axios.get(`http://localhost:5000/api/courses?${params}`)
        
        setCourses(data.courses)
        setCurrentPage(data.pagination.page)
        setTotalPages(data.pagination.totalPages)
        setTotalCourses(data.pagination.total)
        setHasMore(data.pagination.hasMore)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError({
          title: "Failed to load courses",
          message: err.response?.data?.message || "An unexpected error occurred. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchCourses()
  }, [currentPage, selectedCategory, selectedDifficulty, debouncedSearch, sortBy])

  // Fetch enrolled courses
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!studentId) return
      try {
        const result = await courseService.getEnrolledCourses(studentId)
        if (result.success && result.data) {
          const enrolledIds = result.data.map((c) => c._id)
          setEnrolledCourses(enrolledIds)
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err)
      }
    }
    fetchEnrolledCourses()
  }, [studentId])

  // Handle enroll with toast notifications
  const handleEnroll = async (courseId) => {
    if (!studentId) {
      toast.error("Please log in first")
      return
    }

    if (enrolledCourses.includes(courseId)) {
      toast.error("You are already enrolled in this course!")
      return
    }

    const loadingToast = toast.loading("Enrolling...")

    try {
      const result = await courseService.enrollCourse(studentId, courseId)
      if (result.success) {
        setEnrolledCourses([...enrolledCourses, courseId])
        toast.success("Successfully enrolled!", { id: loadingToast })
        setTimeout(() => {
          navigate(`/student/coursePage/${courseId}`)
        }, 500)
      } else {
        toast.error(result.error || "Failed to enroll in course", { id: loadingToast })
      }
    } catch (err) {
      console.error("Enrollment error:", err)
      toast.error("Error enrolling in course", { id: loadingToast })
    }
  }

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Clear all filters
  const handleClearFilters = () => {
    setSearchInput("")
    setSelectedCategory("all")
    setSelectedDifficulty("All Levels")
    setSortBy("newest")
    setCurrentPage(1)
  }

  // Retry after error
  const handleRetry = () => {
    setCurrentPage(1)
    // Trigger refetch by changing a dependency
    setLoading(true)
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />
      <AppHeader subtitle="Browse Courses" />

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-4xl font-bold mb-3">Explore Our Courses</h2>
          {/* <p className="text-lg text-gray-600">
            Discover new skills and advance your career with our comprehensive course catalog.
          </p> */}
        </motion.div>

        {/* Search + Filters */}
        <SearchFilters
          searchQuery={searchInput}
          setSearchQuery={setSearchInput}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
          sortBy={sortBy}
          setSortBy={setSortBy}
          categories={categories}
        />

        {/* Course Count */}
        {!loading && !error && (
          <p className="text-gray-600 mt-6 mb-4">
            Showing{" "}
            <span className="font-semibold text-gray-900">{courses.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalCourses}</span> courses
          </p>
        )}

        {/* Error State */}
        {error && <ErrorState error={error} onRetry={handleRetry} />}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} index={i} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && courses.length === 0 && (
          <EmptyState
            searchQuery={debouncedSearch}
            selectedCategory={selectedCategory}
            selectedDifficulty={selectedDifficulty}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Course Grid */}
        {!loading && !error && courses.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
              {courses.map((course, index) => (
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
                    rating: course.averageRating || course.rating || 0,
                    ratingCount: course.ratingCount || 0,
                    students: course.enrollmentCount || course.students || 0,
                    duration: course.duration || "Self-paced",
                    lessons:
                      course.lessons ??
                      course.lessonsCount ??
                      course.lessonIds?.length ??
                      0,
                    lessonTitles: course.lessonTitles || [],
                    difficulty: course.difficulty,
                    category: course.category || "General",
                    price: course.price > 0 ? `$${course.price}` : "Free",
                    tags: course.tags || [],
                  }}
                  index={index}
                  enrolledCourses={enrolledCourses}
                  handleEnroll={handleEnroll}
                  canAccessCourse={isStudent}
                />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasMore={hasMore}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </div>
    </div>
  )
}
