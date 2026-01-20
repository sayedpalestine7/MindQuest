import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SearchBar from "./SearchBar"
import FiltersBar from "./FiltersBar"
import CourseCard from "./CourseCard"
import PreviewModalRefactored from "../../courseBuilder/PreviewModalRefactored"
import { Loader2, BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react"
import axios from "axios"
import { courseService } from "../../../services/courseService"

export default function CoursesTable() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("pending") // Default to pending for admin review
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [teacherFilter, setTeacherFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [previewCourse, setPreviewCourse] = useState(null)
  const [previewLessons, setPreviewLessons] = useState([])
  const [loadingPreview, setLoadingPreview] = useState(false)

  // Fetch courses from database based on approval status
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")
        
        // Fetch courses by approval status (pending, approved, rejected, or all)
        let url = "http://localhost:5000/api/courses"
        const params = []
        
        // Add limit=all for admin to get all courses without pagination
        params.push("limit=all")
        
        // Add archived=all to show archived courses to admin
        params.push("archived=all")
        
        if (statusFilter === "pending" || statusFilter === "approved" || statusFilter === "rejected") {
          params.push(`approvalStatus=${statusFilter}`)
        } else if (statusFilter === "draft") {
          params.push("approvalStatus=draft")
        } else if (statusFilter === "all") {
          // Explicitly pass 'all' to get courses regardless of approval status
          params.push("approvalStatus=all")
        }
        
        if (params.length > 0) {
          url += `?${params.join("&")}`
        }
        
        const res = await axios.get(url, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        
        // Backend returns array directly when limit=all, otherwise returns { courses, pagination }
        const coursesData = Array.isArray(res.data) ? res.data : res.data.courses || []
        
        // Transform data to match expected format
        const transformedCourses = coursesData.map((course) => ({
          id: course._id,
          title: course.title || "",
          description: course.description || "",
          category: course.category || "General",
          teacher: {
            id: course.teacherId?._id || course.teacherId,
            name: course.teacherId?.name || "Unknown",
            avatar: course.teacherId?.avatar || course.teacherId?.profileImage,
          },
          studentsEnrolled: course.students || 0,
          createdAt: course.createdAt,
          status: course.approvalStatus || "draft",
          published: course.published ?? false,
          thumbnail: course.thumbnail || "https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=800&q=80",
          difficulty: course.difficulty || "Beginner",
          rating: course.rating || 0,
          lessonsCount: course.lessonsCount || 0,
          duration: course.duration || "N/A",
          approvalStatus: course.approvalStatus || "draft",
          submittedAt: course.submittedAt,
          reviewedAt: course.reviewedAt,
          rejectionReason: course.rejectionReason,
        }))
        
        setCourses(transformedCourses)
      } catch (err) {
        console.error("Failed to fetch courses", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCourses()
  }, [statusFilter]) // Re-fetch when status filter changes

  const approveCourse = async (id) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("No authentication token found. Please log in.")
        return
      }
      
      const response = await axios.patch(
        `http://localhost:5000/api/courses/${id}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Remove from pending list after approval
      setCourses((prev) => prev.filter((c) => c.id !== id))
      alert(response.data.message || "Course approved successfully")
    } catch (err) {
      console.error("Failed to approve course", err)
      alert(err.response?.data?.message || "Failed to approve course")
    }
  }

  const rejectCourse = async (id) => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        alert("No authentication token found. Please log in.")
        return
      }
      
      const reason = prompt("Enter rejection reason (optional):")
      if (reason === null) return // User cancelled
      
      const response = await axios.patch(
        `http://localhost:5000/api/courses/${id}/reject`,
        { reason: reason || "No reason provided" },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Remove from pending list after rejection
      setCourses((prev) => prev.filter((c) => c.id !== id))
      alert(response.data.message || "Course rejected successfully")
    } catch (err) {
      console.error("Failed to reject course", err)
      alert(err.response?.data?.message || "Failed to reject course")
    }
  }

  const deleteCourse = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "⚠️ Are you sure you want to permanently delete this course? This action cannot be undone and will remove all course data including lessons, quizzes, and fields."
      )
      if (!confirmDelete) return

      const token = localStorage.getItem("token")
      if (!token) {
        alert("No authentication token found. Please log in.")
        return
      }

      const response = await courseService.deleteCourse(id)
      
      if (response.success) {
        // Remove course from list
        setCourses((prev) => prev.filter((c) => c.id !== id))
        alert(response.message || "Course deleted successfully")
      } else {
        alert(response.message || "Failed to delete course")
      }
    } catch (err) {
      console.error("Failed to delete course", err)
      alert(err.response?.data?.message || err.message || "Failed to delete course")
    }
  }

  const handleViewCourse = async (course) => {
    setLoadingPreview(true)
    try {
      // Fetch full course data with lessons using courseService
      const result = await courseService.getCourseById(course.id)
      
      if (result.success && result.data) {
        const fullCourse = result.data
        
        // Transform quiz data if exists
        let finalQuizData = null
        if (fullCourse.quizId && fullCourse.quizId.questionIds && Array.isArray(fullCourse.quizId.questionIds)) {
          finalQuizData = {
            questions: fullCourse.quizId.questionIds.map((q) => ({
              id: q._id || q.id,
              type: q.type || 'mcq',
              question: q.text || q.question || '',
              options: Array.isArray(q.options) ? q.options : [],
              correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
              correctAnswer: q.correctAnswer || '',
              points: q.points || 1,
              explanation: q.explanation || '',
            })),
            passingScore: fullCourse.quizId.passingScore || 70,
            points: fullCourse.quizId.points || 100,
          }
        }
        
        // Transform lessons with fields
        const transformedLessons = (fullCourse.lessonIds || []).map((lesson) => ({
          id: lesson._id,
          title: lesson.title,
          fields: (lesson.fieldIds || []).map((f) => {
            let content = f.content
            if (f.type === "table" && (!content || typeof content !== "object" || !content.data)) {
              content = {
                rows: 3,
                columns: 3,
                data: Array(3).fill(null).map(() => Array(3).fill(""))
              }
            }
            return {
              id: f._id,
              type: f.type,
              content: content,
              language: f.language,
              animationId: f.animationId,
              htmlContent: f.htmlContent,
              correctAnswer: f.correctAnswer,
              answer: f.answer,
              explanation: f.explanation,
            }
          }),
        }))
        
        // Set preview data
        setPreviewCourse({
          id: fullCourse._id,
          title: fullCourse.title,
          description: fullCourse.description,
          difficulty: fullCourse.difficulty,
          thumbnail: fullCourse.thumbnail,
          finalQuiz: finalQuizData,
        })
        setPreviewLessons(transformedLessons)
      } else {
        alert("Failed to load course preview: " + (result.error || "Unknown error"))
      }
    } catch (err) {
      console.error("Failed to load course for preview", err)
      alert("Failed to load course preview")
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleClosePreview = () => {
    setPreviewCourse(null)
    setPreviewLessons([])
  }

  const categories = useMemo(() => [...new Set(courses.map((c) => c.category))], [courses])

  const teachers = useMemo(() => {
    const map = new Map()
    courses.forEach((c) => {
      if (!map.has(c.teacher.id)) map.set(c.teacher.id, c.teacher)
    })
    return Array.from(map.values())
  }, [courses])

  const filtered = useMemo(() => {
    return courses
      .filter((c) => {
        const matchSearch =
          (c.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.teacher?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        const matchCat = categoryFilter === "all" || c.category === categoryFilter
        const matchTeacher = teacherFilter === "all" || c.teacher.id === teacherFilter
        return matchSearch && matchStatus && matchCat && matchTeacher
      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortBy === "students") return b.studentsEnrolled - a.studentsEnrolled
        return (a.title || "").localeCompare(b.title || "")
      })
  }, [courses, searchQuery, statusFilter, categoryFilter, teacherFilter, sortBy])

  if (loading) {
    return (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
    )
  }

  // Calculate stats
  const totalStudents = courses.reduce((sum, c) => sum + (c.studentsEnrolled || 0), 0)
  const uniqueTeachers = new Set(courses.map(c => c.teacher.id)).size
  const avgRating = courses.length > 0 
    ? (courses.reduce((sum, c) => sum + (c.rating || 0), 0) / courses.length).toFixed(1)
    : 0

  return (
    <div className="space-y-6">
      {/* Stats Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
              <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{courses.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Teachers</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{uniqueTeachers}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <FiltersBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        teacherFilter={teacherFilter}
        setTeacherFilter={setTeacherFilter}
        categories={categories}
        teachers={teachers}
      />

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {courses.length} courses
      </p>
      {/* grid gap-6 md:grid-cols-2 lg:grid-cols-3 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <CourseCard
                course={course}
                onView={() => handleViewCourse(course)}
                onApprove={() => approveCourse(course.id)}
                onReject={() => rejectCourse(course.id)}
                onDelete={() => deleteCourse(course.id)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No courses found.</p>
      )}

      {previewCourse && (
        <PreviewModalRefactored 
          course={previewCourse} 
          lessons={previewLessons} 
          onClose={handleClosePreview}
          hideHeader={true}
        />
      )}

      {loadingPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span>Loading preview...</span>
          </div>
        </div>
      )}
    </div>
  )
}
