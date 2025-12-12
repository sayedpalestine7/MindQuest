"use client"

import { motion } from "framer-motion"
import { ChevronRight, BookOpen, Users, Plus } from "lucide-react"
import { useNavigate } from "react-router"

export default function CoursesSection({ courses = [] }) {
  const navigate = useNavigate() 

  if (!courses || courses.length === 0) {
    return (
      <motion.div
        className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-dashed border-blue-300"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-center gap-4 mb-4">
          <BookOpen className="w-10 h-10 text-blue-600" />
          <h3 className="text-2xl font-semibold text-gray-800">No Courses Yet</h3>
        </div>
        <p className="text-center text-gray-600 mb-6">Start creating your first course to engage with students</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/teacher/courseBuilder")}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center justify-center gap-2 font-semibold"
        >
          <Plus className="w-5 h-5" /> Create Your First Course
        </motion.button>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white rounded-2xl shadow-lg overflow-hidden"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BookOpen className="w-7 h-7 text-white" />
          <h3 className="text-2xl font-bold text-white">Your Courses</h3>
          <span className="bg-white/30 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {courses.length}
          </span>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          className="border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white/20 transition font-semibold"
        >
          View All
        </motion.button>
      </div>

      <div className="divide-y divide-gray-100">
        {courses.map((course, i) => (
          <motion.div
            key={course._id || i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="p-6 hover:bg-gradient-to-r hover:from-blue-50 to-indigo-50 transition-all duration-200 group cursor-pointer"
            whileHover={{ paddingRight: 24 }}
            onClick={() => {
              const cid = course._id || course.id;
              navigate(`/teacher/courseBuilder/${cid}`)
            }}
          >
            <div className="flex justify-between items-start md:items-center gap-4">
              <div className="flex-1">
                <h4 className="text-lg font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition">
                  {course.title || course.name || "Untitled"}
                </h4>
                {course.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-6 flex-shrink-0">
                {course.studentCount !== undefined && (
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    className="text-center"
                  >
                    <div className="flex items-center justify-center gap-1 text-blue-600">
                      <Users className="w-4 h-4" />
                      <span className="font-bold text-lg">{course.studentCount}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Students</p>
                  </motion.div>
                )}
                <motion.div
                  whileHover={{ translateX: 4 }}
                  className="text-gray-400 group-hover:text-blue-600 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/teacher/courseBuilder")}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-md transition font-semibold flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add New Course
        </motion.button>
      </div>
    </motion.div>
  )
}
