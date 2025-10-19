import { motion } from "framer-motion"
import { Edit, Sparkles } from "lucide-react"

export default function ProfileHeader({ onEdit }) {
  return (
    <motion.div
      className="flex items-center justify-between bg-white shadow rounded-2xl p-6"
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center space-x-4">
        <img
          src="/default-avatar.png"
          alt="Teacher"
          className="w-20 h-20 rounded-full border-4 border-blue-200 object-cover"
        />
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            Alaa Al-Din <Sparkles className="text-yellow-500" />
          </h2>
          <p className="text-gray-500">Software Engineering | Algorithms</p>
        </div>
      </div>

      <button
        onClick={onEdit}
        className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
      >
        <Edit className="w-4 h-4 mr-2" /> Edit Profile
      </button>
    </motion.div>
  )
}
