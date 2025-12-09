// src/pages/admin/teacher-verification/TeacherCard.jsx
import React from "react"
import { motion } from "framer-motion"

export default function TeacherCard({ teacher, onView }) {
  const profileImage =
    teacher.avatar ||
    (teacher.certificates && teacher.certificates.length > 0
      ? teacher.certificates[0]
      : "/default-avatar.png");

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
      <div className="relative overflow-hidden bg-gray-900 border border-gray-700 rounded-xl shadow-md p-4 flex flex-col items-center text-center">
        {/* Profile Image */}
        <img
          src={profileImage}
          alt={teacher.name}
          className="w-20 h-20 rounded-full object-cover border border-gray-700 mb-3"
        />

        {/* Name */}
        <h3 className="font-semibold text-base-200 text-lg">{teacher.name}</h3>

        {/* Specialization */}
        <span className="mt-1 px-3 py-1 text-xs text-base-200 bg-gray-700 rounded-full">
          {teacher.specialization}
        </span>

        {/* View Button */}
        <div className="w-full mt-4">
          <button
            onClick={onView}
            className="w-full border border-gray-700 text-base-200 rounded py-1 hover:bg-gray-100 hover:text-gray-700"
          >
            View
          </button>
        </div>
      </div>
    </motion.div>
  )
}
