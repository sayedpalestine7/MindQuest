"use client"

import { motion } from "framer-motion"
import { TrendingUp, Award, Target, Zap } from "lucide-react"

export default function PerformanceSection({ stats = {} }) {
  // Calculate performance metrics
  const studentEngagement = stats.totalStudents ? Math.min(100, (stats.totalStudents / 500) * 100) : 0
  const courseCompletion = stats.totalCourses ? Math.min(100, (stats.totalCourses / 10) * 100) : 0
  const ratingPercentage = stats.rating ? (stats.rating / 5) * 100 : 0

  return (
    <motion.div
      className="bg-white shadow rounded-2xl p-6"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-6">
        <TrendingUp className="text-green-600" /> Performance Overview
      </h3>

      <div className="space-y-6">
        {/* Student Engagement */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Student Engagement</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{Math.round(studentEngagement)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${studentEngagement}%` }}
              transition={{ duration: 1.2, delay: 0.2 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.totalStudents || 0} students enrolled</p>
        </div>

        {/* Course Development */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Course Development</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{Math.round(courseCompletion)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${courseCompletion}%` }}
              transition={{ duration: 1.2, delay: 0.4 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">{stats.totalCourses || 0} courses published</p>
        </div>

        {/* Rating Performance */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">Instructor Rating</span>
            </div>
            <span className="text-sm font-bold text-gray-800">{(stats.rating || 0).toFixed(1)}/5.0</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${ratingPercentage}%` }}
              transition={{ duration: 1.2, delay: 0.6 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Based on student feedback</p>
        </div>

        {/* Total Points */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 text-white p-2 rounded-lg">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Achievement Points</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.totalPoints || 0}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
