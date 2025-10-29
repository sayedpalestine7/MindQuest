import { Brain } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router"

export default function Header({ onLogout }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <header className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 text-white p-2 rounded-lg font-bold text-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">MindQuest</h1>
              <p className="text-sm text-gray-500">Student Profile</p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/courses")} className="border px-4 py-2 rounded-md hover:bg-gray-100">Browse Courses</button>
            <button onClick={onLogout} className="border px-4 py-2 rounded-md hover:bg-gray-100">Logout</button>
          </div>
        </div>
      </header>
    </motion.div>
  )
}
