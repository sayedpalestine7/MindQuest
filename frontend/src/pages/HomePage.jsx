import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { motion } from "framer-motion"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import AppHeader from "../components/shared/AppHeader"
import Hero from "../components/homePage/Hero.jsx"
import Features from "../components/homePage/Features.jsx"
import AnimationShowcase from "../components/homePage/AnimationShowcase.jsx"
import HowItWorks from "../components/homePage/HowItWorks.jsx"
import Statistics from "../components/homePage/Statistics.jsx"
import FAQ from "../components/homePage/FAQ.jsx"
import CTA from "../components/homePage/CTA.jsx"
import Footer from "../components/homePage/Footer.jsx"
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

export default function HomePage() {
  const navigate = useNavigate()
  const { isAuthenticated, isStudent, isTeacher, isAdmin } = useAuth()
  
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
  const [sortBy, setSortBy] = useState("popular")
  const [categories, setCategories] = useState(["all"])
  
  // Student data
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [studentId, setStudentId] = useState(null)
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchInput, 500)

  // Get student ID from auth on mount
  useEffect(() => {
    if (!isStudent) {
      setStudentId(null)
      setEnrolledCourses([])
      return
    }

    const userId = localStorage.getItem("userId")
    if (userId) {
      setStudentId(userId)
    }
  }, [isStudent])

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/courses/categories")
        const categoriesArray = Array.isArray(data) ? data : []
        if (!categoriesArray.includes('all')) {
          setCategories(['all', ...categoriesArray])
        } else {
          setCategories(categoriesArray)
        }
      } catch (err) {
        console.error("Error fetching categories:", err)
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
        const params = new URLSearchParams({
          page: currentPage,
          limit: 6,
          sortBy: sortBy,
        })

        if (selectedCategory && selectedCategory !== "all") {
          params.append("category", selectedCategory)
        }

        if (selectedDifficulty && selectedDifficulty !== "All Levels") {
          params.append("difficulty", difficultyMap[selectedDifficulty])
        }

        if (debouncedSearch) {
          params.append("search", debouncedSearch)
        }

        const response = await axios.get(`http://localhost:5000/api/courses?${params.toString()}`)

        setCourses(response.data.courses || [])
        setCurrentPage(response.data.pagination?.page || currentPage)
        setTotalPages(response.data.pagination?.totalPages || 1)
        setTotalCourses(response.data.pagination?.total || 0)
        setHasMore(response.data.pagination?.hasMore || false)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError({
          title: "Failed to load courses",
          message: err.response?.data?.message || err.message || "Please try again later."
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
      if (!studentId || !isStudent) return
      try {
        const result = await courseService.getEnrolledCourses(studentId)
        if (result.success && result.data) {
          const enrolledIds = result.data.map((c) => c._id || c.id)
          setEnrolledCourses(enrolledIds)
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err)
      }
    }
    fetchEnrolledCourses()
  }, [studentId, isStudent])

  // Handle enroll with toast notifications
  const handleEnroll = async (courseId) => {
    if (!studentId) {
      toast.error("Please log in to enroll in courses")
      return
    }

    if (enrolledCourses.includes(courseId)) {
      toast.error("You are already enrolled in this course")
      return
    }

    const loadingToast = toast.loading("Enrolling...")

    try {
      const result = await courseService.enrollCourse(studentId, courseId)
      if (result.success) {
        setEnrolledCourses([...enrolledCourses, courseId])
        toast.success("Successfully enrolled in the course!", { id: loadingToast })
      } else {
        toast.error(result.error || "Failed to enroll in course", { id: loadingToast })
      }
    } catch (err) {
      toast.error("Failed to enroll in course", { id: loadingToast })
      console.error("Error enrolling in course:", err)
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
    setCurrentPage(1)
  }

  // Retry after error
  const handleRetry = () => {
    setError(null)
    setCurrentPage(1)
  }

  const handleSignUpAsStudent = () => {
    navigate("/signup")
  }

  const canAccessCourses = isStudent
  const showStudentPrompt = !isAuthenticated
  const showNonStudentNote = isAuthenticated && !isStudent

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      <AppHeader subtitle="Welcome" />
      <Hero />
      <Features />
      <AnimationShowcase />
      
      {/* Browse Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
          </motion.div>

          {/* <SearchFilters
            searchQuery={searchInput}
            setSearchQuery={setSearchInput}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedDifficulty={selectedDifficulty}
            setSelectedDifficulty={setSelectedDifficulty}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={categories}
          /> */}

          {showStudentPrompt && (
            <div className="mb-6 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-blue-900">
                Sign in as a student to view and enroll in courses.
              </p>
              <button
                onClick={handleSignUpAsStudent}
                className="mq-btn-primary px-4 py-2"
              >
                Sign up as student
              </button>
            </div>
          )}

          {showNonStudentNote && (
            <div className="mb-6 rounded-lg border border-gray-200 bg-white px-4 py-3">
              <p className="text-sm text-gray-700">
                Course access and enrollment are available to student accounts only.
              </p>
            </div>
          )}

          {!loading && !error && (
            <p className="text-gray-600 mt-6 mb-4">
              Showing{" "}
              <span className="font-semibold text-gray-900">{courses.length}</span> of{" "}
              <span className="font-semibold text-gray-900">{totalCourses}</span> courses
            </p>
          )}

          {error && <ErrorState error={error} onRetry={handleRetry} />}

          {loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <CourseCardSkeleton key={i} index={i} />
              ))}
            </div>
          )}

          {!loading && !error && courses.length === 0 && (
            <EmptyState
              searchQuery={debouncedSearch}
              selectedCategory={selectedCategory}
              selectedDifficulty={selectedDifficulty}
              onClearFilters={handleClearFilters}
            />
          )}

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
                    canAccessCourse={canAccessCourses}
                  />
                ))}
              </div>

              {/* <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
                onPageChange={handlePageChange}
              /> */}
            </>
          )}
        </div>
      </section>

      <HowItWorks />
      <Statistics />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  )
}
