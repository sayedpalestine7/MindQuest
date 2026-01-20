import Sidebar from "./Sidebar"
import CoursesTable from "./course/CoursesTable"
import { motion } from "framer-motion"
import { BookCheck } from "lucide-react"


function ManageCourses() {
    return (
    <div className="min-h-screen bg-base-200">

      <div className="flex min-h-screen bg-base-200">
        <Sidebar />
        <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Course Submissions
            </h1>
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review and manage course submissions from teachers. Approve, reject, or delete courses as needed.
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </motion.div>
          <CoursesTable/>
        </div>
      </div>
    </div>
  )
}

export default ManageCourses