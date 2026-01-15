"use client"

import { motion } from "framer-motion"
import { ChevronRight, BookOpen, Users, Plus, Search, Send, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router"
import { useState } from "react"
import axios from "axios"

export default function CoursesSection({ courses = [], activeCourseId, onCourseSelect, onCourseUpdate }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [submittingCourseId, setSubmittingCourseId] = useState(null)
  
  const handleSubmitForReview = async (e, courseId, approvalStatus) => {
    e.stopPropagation()
    
    // Only allow submission for draft or rejected courses
    if (approvalStatus !== "draft" && approvalStatus !== "rejected") {
      alert(`Course is already ${approvalStatus}`)
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
      alert(response.data.message || "Course submitted for review successfully")
    } catch (error) {
      console.error("Error submitting course for review:", error)
      alert(error.response?.data?.message || "Failed to submit course for review")
    } finally {
      setSubmittingCourseId(null)
    }
  }
  
  // Filter courses based on search query
  const filteredCourses = courses.filter(course => {
    const title = course.title || course.name || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  }) 

  if (!courses || courses.length === 0) {
    return (
      <motion.div
        className="rounded-lg p-6 border-2 border-dashed"
        style={{ backgroundColor: '#E8EAF6', borderColor: '#C5CAE9' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <BookOpen className="w-10 h-10" style={{ color: '#3F51B5' }} />
          <h3 className="text-2xl font-semibold" style={{ color: '#263238' }}>No Courses Yet</h3>
        </div>
        <p className="text-center mb-6" style={{ color: '#607D8B' }}>Start creating your first course to engage with students</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/teacher/courseBuilder")}
          className="w-full text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
          style={{ background: 'linear-gradient(to right, #3F51B5, #5C6BC0)' }}
        >
          <Plus className="w-5 h-5" /> Create Your First Course
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="shadow-lg overflow-hidden"
      style={{ backgroundColor: '#FFFFFF' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="p-4" style={{ background: 'linear-gradient(to right, #3F51B5, #5C6BC0)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-white" />
            <h3 className="text-2xl font-bold text-white">Your Courses</h3>
            <span className="text-white px-3 py-1 rounded-full text-sm font-semibold" style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
              {courses.length}
            </span>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/teacher/courseBuilder")}
            className="bg-white px-4 py-2 rounded-lg hover:opacity-90 transition font-semibold flex items-center gap-2"
            style={{ color: '#3F51B5' }}
          >
            <Plus className="w-4 h-4" /> New Course
          </motion.button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#3F51B5' }} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white placeholder-slate-500 focus:outline-none focus:ring-2"
            style={{ color: '#263238', '--tw-ring-color': 'rgba(63, 81, 181, 0.3)' }}
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
            className="p-4 transition-all duration-200 group cursor-pointer"
            style={{
              backgroundColor: isActive ? '#E8EAF6' : 'transparent',
              borderLeft: isActive ? '4px solid #3F51B5' : 'none'
            }}
            whileHover={{ paddingRight: 24 }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = '#F5F7FA';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
            onClick={() => {
              if (onCourseSelect) {
                onCourseSelect(cid);
              }
              navigate(`/teacher/courseBuilder/${cid}`)
            }}
          >
            <div className="flex justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold mb-2 group-hover:transition" style={{ color: '#263238' }}>
                  {course.title || course.name || "Untitled"}
                </h4>
                {course.description && (
                  <p className="text-sm line-clamp-2" style={{ color: '#607D8B' }}>
                    {course.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {course.studentCount !== undefined && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1" style={{ color: '#3F51B5' }}>
                      <Users className="w-4 h-4" />
                      <span className="font-bold text-lg">{course.studentCount}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#607D8B' }}>Students</p>
                  </motion.div>
                )}
                
                {/* Approval Status Badge */}
                {course.approvalStatus === "pending" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md"
                    style={{ backgroundColor: '#FFF3E0', color: '#F57C00' }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Pending Review</span>
                  </motion.div>
                )}
                
                {course.approvalStatus === "approved" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md"
                    style={{ backgroundColor: '#E8F5E9', color: '#2E7D32' }}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Approved</span>
                  </motion.div>
                )}
                
                {course.approvalStatus === "rejected" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md"
                    style={{ backgroundColor: '#FFEBEE', color: '#C62828' }}
                    title={course.rejectionReason || "No reason provided"}
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span className="text-xs font-semibold">Rejected</span>
                  </motion.div>
                )}
                
                {/* Submit for Review Button - Only show for draft or rejected courses */}
                {(course.approvalStatus === "draft" || course.approvalStatus === "rejected" || !course.approvalStatus) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleSubmitForReview(e, cid, course.approvalStatus || "draft")}
                    disabled={submittingCourseId === cid}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: '#26A69A', 
                      color: '#FFFFFF' 
                    }}
                  >
                    {submittingCourseId === cid ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        {course.approvalStatus === "rejected" ? "Resubmit" : "Submit for Review"}
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )})}
      </div>

    </motion.div>
  )
}
