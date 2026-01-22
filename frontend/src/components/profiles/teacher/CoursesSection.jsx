"use client"

import { motion } from "framer-motion"
import { ChevronRight, BookOpen, Users, Plus, Search, Send, CheckCircle, Clock, XCircle, AlertCircle, MoreVertical, Trash2 } from "lucide-react"
import { useNavigate } from "react-router"
import { useState, useEffect } from "react"
import axios from "axios"
import toast, { Toaster } from "react-hot-toast"
import { courseService } from "../../../services/courseService"

export default function CoursesSection({ courses = [], activeCourseId, onCourseSelect, onCourseUpdate, onCourseDelete }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [submittingCourseId, setSubmittingCourseId] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [isDeletingId, setIsDeletingId] = useState(null)
  
  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenMenuId(null)
        setDeleteConfirmId(null)
      }
    }
    
    if (openMenuId || deleteConfirmId) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [openMenuId, deleteConfirmId])
  
  const handleSubmitForReview = async (e, courseId, approvalStatus) => {
    e.stopPropagation()
    
    // Only allow submission for draft or rejected courses
    if (approvalStatus !== "draft" && approvalStatus !== "rejected") {
      toast.error(`Course is already ${approvalStatus}`)
      return
    }
    
    try {
      setSubmittingCourseId(courseId)
      const token = localStorage.getItem("token")
      
      const response = await axios.patch(
        `http://localhost:5000/api/courses/${courseId}/submit`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      
      // Update the course in the parent component
      if (onCourseUpdate) {
        onCourseUpdate(response.data.course)
      }
      
      // Success feedback
      toast.success(response.data.message || "Course submitted for review successfully")
      
      // Refresh the page to show updated status
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error("Error submitting course for review:", error)
      toast.error(error.response?.data?.message || "Failed to submit course for review")
    } finally {
      setSubmittingCourseId(null)
    }
  }
  
  const handleDeleteCourse = async (courseId) => {
    try {
      setIsDeletingId(courseId)
      const result = await courseService.deleteCourse(courseId)
      
      if (result.success) {
        // Handle based on action type
        if (result.action === "archived") {
          toast.success("Course archived successfully")
          // Remove archived course from UI (archived courses are hidden from teacher list)
          if (onCourseDelete) {
            onCourseDelete(courseId)
          }
        } else if (result.action === "deleted") {
          toast.success("Course deleted successfully")
          // Remove course from UI
          if (onCourseDelete) {
            onCourseDelete(courseId)
          }
        }
        
        setDeleteConfirmId(null)
      } else {
        // Handle blocked deletion (approved course with enrollments)
        if (result.action === "blocked") {
          toast.error(result.error || `Cannot delete course with ${result.enrollmentCount} enrolled students`)
          setDeleteConfirmId(null)
        } else {
          toast.error(result.error || "Failed to delete course")
        }
      }
    } catch (error) {
      console.error("Error deleting course:", error)
      toast.error("Failed to delete course")
    } finally {
      setIsDeletingId(null)
    }
  }
  
  const handleToggleMenu = (e, courseId) => {
    e.stopPropagation()
    setOpenMenuId(openMenuId === courseId ? null : courseId)
  }
  
  const handleDeleteClick = (e, courseId) => {
    e.stopPropagation()
    setOpenMenuId(null)
    setDeleteConfirmId(courseId)
  }
  
  // Filter courses based on search query and exclude archived courses
  const filteredCourses = courses.filter(course => {
    const title = course.title || course.name || "";
    const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase());
    const isNotArchived = !course.archived;
    return matchesSearch && isNotArchived;
  }) 

  if (!courses || courses.length === 0) {
    return (
      <>
        <Toaster position="top-right" />
        <motion.div
          className="mq-card p-6 border-2 border-dashed bg-blue-50 border-blue-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <BookOpen className="w-10 h-10 text-blue-600" />
            <h3 className="text-2xl font-semibold text-slate-800">No Courses Yet</h3>
          </div>
          <p className="text-center mb-6 text-slate-500">Start creating your first course to engage with students</p>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/teacher/courseBuilder")}
            className="mq-btn-primary w-full px-6 py-3"
          >
            <Plus className="w-5 h-5" /> Create Your First Course
          </motion.button>
        </motion.div>
      </>
    )
  }

  return (
    <>
      <Toaster position="top" />
      <motion.div
        className="overflow-hidden"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
      <div className="p-4 border-b border-gray-200 mb-4">
        {/* <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-white" />
            <h3 className="text-2xl font-bold text-white">Your Courses</h3>
            <span className="text-white px-3 py-1 rounded-full text-sm font-semibold bg-white/20">
              {courses.length}
            </span>
          </div>
          <div className="buttons flex items-center gap-3">
            <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/teacher/studio/:id")}
            className="mq-btn-outline bg-white text-blue-600 px-4 py-2"
          >
            <Plus className="w-4 h-4" />The Studio
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/teacher/courseBuilder")}
            className="mq-btn-outline bg-white text-blue-600 px-4 py-2"
          >
            <Plus className="w-4 h-4" /> New Course
          </motion.button>
          </div>
        </div> */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-600" />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white placeholder-slate-500 text-slate-800 focus:outline-none focus:ring-blue-500 border border-slate-300 rounded-md focus:ring-2 focus:border-transparent"
          />
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredCourses.map((course, i) => {
          const cid = course._id || course.id;
          const isActive = activeCourseId === cid;

          return (
            <motion.div
              key={cid || i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
              className={`p-4 m-3 transition-all duration-200 group cursor-pointer mq-card shadow-sm ${
                isActive ? "bg-blue-50 border-blue-600" : "border-transparent hover:bg-slate-50"
              }`}
              whileHover={{ paddingRight: 24 }}
              onClick={() => {
                if (onCourseSelect) {
                  onCourseSelect(cid);
                }
                navigate(`/teacher/courseBuilder/${cid}`);
              }}
            >
              <div className="flex justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h4 className="text-lg font-bold mb-2 text-slate-800">
                    {course.title || course.name || "Untitled"}
                  </h4>
                  {course.description && (
                    <p className="text-sm line-clamp-2 text-slate-500">
                      {course.description.length > 80
                        ? course.description.substring(0, 80) + "..."
                        : course.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-shrink-0 relative ">
                  {(() => {
                    const studentCount =
                      course.studentCount ??
                      course.enrollmentCount ??
                      (Array.isArray(course.students) ? course.students.length : undefined)

                    if (studentCount === undefined) {
                      return null
                    }

                    return (
                      <motion.div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <Users className="w-4 h-4" />
                          <span className="font-bold text-lg">{studentCount}</span>
                        </div>
                      </motion.div>
                    )
                  })()}

                  {course.approvalStatus === "pending" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-amber-50 text-amber-700"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Pending Review</span>
                    </motion.div>
                  )}

                  {course.approvalStatus === "approved" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Approved</span>
                    </motion.div>
                  )}

                  {course.approvalStatus === "rejected" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 text-red-700"
                      title={course.rejectionReason || "No reason provided"}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span className="text-xs font-semibold">Rejected</span>
                    </motion.div>
                  )}

                  {(course.approvalStatus === "draft" || course.approvalStatus === "rejected" || !course.approvalStatus) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => handleSubmitForReview(e, cid, course.approvalStatus || "draft")}
                      disabled={submittingCourseId === cid}
                      className="mq-btn-primary px-3 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingCourseId === cid ? "Processing..." : "Submit for Review"}
                    </motion.button>
                  )}

                  <button
                    onClick={(e) => handleToggleMenu(e, cid)}
                    className="p-2 rounded-full hover:bg-slate-100 transition"
                    aria-label="Course actions"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-500" />
                  </button>

                  {openMenuId === cid && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(null);
                        }}
                      />

                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={(e) => handleDeleteClick(e, cid)}
                          disabled={course.archived}
                          className="w-full px-4 py-2 text-left text-sm font-medium hover:bg-red-50 transition flex items-center gap-2 text-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2 className="w-4 h-4" />
                          {course.archived
                            ? 'Archived'
                            : course.approvalStatus === 'approved' && (course.enrollmentCount || course.students || 0) === 0
                            ? 'Archive course'
                            : 'Delete course'}
                        </button>
                      </motion.div>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </motion.div>
    
    {/* Delete Confirmation Modal */}
    {deleteConfirmId && (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation()
          setDeleteConfirmId(null)
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
            <h2 className="text-2xl font-bold text-white">
              {(() => {
                const course = courses.find(c => (c._id || c.id) === deleteConfirmId);
                const isApproved = course?.approvalStatus === 'approved';
                const hasEnrollments = (course?.enrollmentCount || course?.students || 0) > 0;
                return isApproved && !hasEnrollments ? 'Archive Course' : 'Delete Course';
              })()}
            </h2>
            <p className="text-red-100 text-sm mt-1">
              {(() => {
                const course = courses.find(c => (c._id || c.id) === deleteConfirmId);
                const isApproved = course?.approvalStatus === 'approved';
                const hasEnrollments = (course?.enrollmentCount || course?.students || 0) > 0;
                return isApproved && !hasEnrollments ? 'This will unpublish the course' : 'This action cannot be undone';
              })()}
            </p>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-gray-800 font-medium mb-2">
                  {(() => {
                    const course = courses.find(c => (c._id || c.id) === deleteConfirmId);
                    const isApproved = course?.approvalStatus === 'approved';
                    const hasEnrollments = (course?.enrollmentCount || course?.students || 0) > 0;
                    if (isApproved && hasEnrollments) {
                      return 'This approved course has enrolled students and cannot be deleted.';
                    } else if (isApproved && !hasEnrollments) {
                      return 'Are you sure you want to archive this course?';
                    } else {
                      return 'Are you sure you want to delete this course?';
                    }
                  })()}
                </p>
                <p className="text-sm text-gray-600">
                  {(() => {
                    const course = courses.find(c => (c._id || c.id) === deleteConfirmId);
                    const isApproved = course?.approvalStatus === 'approved';
                    const hasEnrollments = (course?.enrollmentCount || course?.students || 0) > 0;
                    if (isApproved && hasEnrollments) {
                      return 'Please contact support if you need assistance removing this course.';
                    } else if (isApproved && !hasEnrollments) {
                      return 'This will unpublish and archive the course. You can restore it later if needed.';
                    } else {
                      return 'This will permanently remove the course, all its lessons, and associated data.';
                    }
                  })()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteConfirmId(null)
                }}
                disabled={isDeletingId === deleteConfirmId}
                className="flex-1 px-4 py-2.5 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteCourse(deleteConfirmId)
                }}
                disabled={isDeletingId === deleteConfirmId}
                className="flex-1 px-4 py-2.5 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#C62828' }}
              >
                {isDeletingId === deleteConfirmId ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    {(() => {
                      const course = courses.find(c => (c._id || c.id) === deleteConfirmId);
                      const isApproved = course?.approvalStatus === 'approved';
                      const hasEnrollments = (course?.enrollmentCount || course?.students || 0) > 0;
                      if (isApproved && hasEnrollments) {
                        return 'Cannot Delete';
                      } else if (isApproved && !hasEnrollments) {
                        return 'Archive Course';
                      } else {
                        return 'Delete Course';
                      }
                    })()}
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    )}
    </>
  )
}
