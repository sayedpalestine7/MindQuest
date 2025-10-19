import React from "react"
import { motion } from "framer-motion"

export default function ProgressOverview({ stats }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6  }}
    >
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-6">Progress Overview</h3>

      <div className="mb-6">
        <div className="flex justify-between mb-2">
          <span>Overall Completion</span>
          <span className="font-semibold">{stats.overallProgress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
        <motion.div
          className="bg-blue-600  h-3 rounded-full"
          initial={{ width: 0 }}
          animate={{ width:`${stats.overallProgress}%`}}
          transition={{ duration: 1.2 }}
        >
          <div
            style={{ width: `${stats.overallProgress}%` }}
          />
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-gray-500 text-sm">Courses</p>
          <p className="font-bold">{stats.totalCourses}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Completed</p>
          <p className="font-bold">{stats.completedCourses}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Points</p>
          <p className="font-bold">{stats.totalPoints}</p>
        </div>
      </div>
    </div>
    </motion.div>
  )
}
