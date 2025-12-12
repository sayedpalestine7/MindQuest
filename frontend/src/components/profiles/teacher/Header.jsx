import { Brain, LogOut, Plus } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router"

export default function Header({ onLogout, teacherId }) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b shadow-lg sticky top-0 z-20">
        <div className="container mx-auto px-6 py-4 max-w-7xl flex items-center justify-between">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="bg-white/20 backdrop-blur text-white p-2 rounded-lg font-bold text-lg hover:bg-white/30 transition">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl">MindQuest</h1>
              <p className="text-sm text-blue-100">Teacher Dashboard</p>
            </div>
          </motion.div>

          <div className="flex gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to={`/teacher/courseBuilder/${teacherId}`}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2 font-semibold backdrop-blur"
              >
                <Plus className="w-5 h-5" />
                Create Course
              </Link>
            </motion.div>

            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLogout}
              className="bg-white/20 hover:bg-red-500 text-white px-4 py-2 rounded-lg hover:shadow-lg transition flex items-center gap-2 font-semibold backdrop-blur"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </motion.button>
          </div>
        </div>
      </header>
    </motion.div>
  )
}
