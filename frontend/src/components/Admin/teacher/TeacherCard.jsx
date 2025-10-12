// src/pages/admin/teacher-verification/TeacherCard.jsx
import React from "react"
import { motion } from "framer-motion"

export default function TeacherCard({ teacher, onView, onAction }) {
  return (
<motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.1,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          transition: { duration: 0.3 },
        }}
      >
      <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-md p-3">
      <div className="mb-4 flex justify-between ">
        <div>
          <h3 className="font-semibold text-base-200">{teacher.name}</h3>
          <p className="text-sm text-base-200">{teacher.email}</p>
        </div>
        <span className="p-2 text-xs text-base-200 bg-gray-700 rounded radio-xl ">{teacher.specialization}</span>
      </div>
      <p className="text-xs text-base-200 mb-2">{teacher.experience} years experience</p>
      
      {/* Bottons */}
      <div className="flex gap-2 py-3">
        <button onClick={onView} className="flex-1 border border-gray-700 text-base-200 rounded py-1 hover:bg-gray-100 hover:text-gray-700 ">
          View
        </button>
        <button
          onClick={() => onAction("approve")}
          className="flex-1 bg-green-600 text-white rounded py-1 hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => onAction("reject")}
          className="flex-1 bg-red-600 text-white rounded py-1 hover:bg-red-700"
        >
          Reject
        </button>
      </div>
      </div>
    </motion.div>
  )
}
