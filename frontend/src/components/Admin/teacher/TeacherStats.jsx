// src/pages/admin/teacher-verification/TeacherStats.jsx
import { motion } from "framer-motion";

export default function TeacherStats({ teachers, filteredTeachers }) {
  const avgExperience =
    teachers.length > 0
      ? Math.round(teachers.reduce((acc, t) => acc + t.experience, 0) / teachers.length)
      : 0

  return (

    <div className="grid gap-4 md:grid-cols-3 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-base-200">Pending Requests</p>
          <p className="text-2xl text-base-200">{teachers.length}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-base-200">Filtered Results</p>
          <p className="text-2xl text-base-200">{filteredTeachers.length}</p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.6,
          delay: 0.2,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        whileHover={{
          y: -4,
          scale: 1.02,
          boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
          transition: { duration: 0.3 },
        }}
      >
        <div className="rounded border border-gray-700 bg-gray-900 p-4">
          <p className="text-sm text-base-200">Avg. Experience</p>
          <p className="text-2xl text-base-200">{avgExperience} years</p>
        </div>
      </motion.div>
    </div>

  )
}
