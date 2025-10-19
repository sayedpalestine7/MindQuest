"use client"

import { motion } from "framer-motion"
import { ChevronRight, BookOpen } from "lucide-react"

const courses = [
  { name: "Data Structures", students: 120 },
  { name: "Software Design", students: 80 },
  { name: "Operating Systems", students: 65 },
]

export default function CoursesSection() {
  return (
    <motion.div
      className="bg-white shadow rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <BookOpen className="text-blue-600" /> Courses
        </h3>
        <button className="border border-blue-300 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50 transition">
          View All
        </button>
      </div>

      <div className="space-y-3">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            className="flex justify-between items-center border-b pb-2"
            whileHover={{ scale: 1.02 }}
          >
            <p className="font-medium text-gray-700">{course.name}</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {course.students} students <ChevronRight className="w-4 h-4" />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
