import { motion } from "framer-motion"
import { Star, BookOpen, Users, Trophy } from "lucide-react"

export default function ProfileHeader({ profileData, stats, onEdit }) {
  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Left Section: Avatar + Info */}
          <div className="flex items-start gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex-shrink-0"
            >
              {profileData.avatar ? (
                <img
                  src={profileData.avatar}
                  alt="avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-blue-400 flex items-center justify-center shadow-lg">
                  <span className="text-4xl font-bold">{profileData.name?.charAt(0).toUpperCase()}</span>
                </div>
              )}
            </motion.div>

            <div className="flex-1 pt-2">
              <h1 className="text-4xl font-bold mb-2">{profileData.name}</h1>
              <p className="text-blue-100 mb-1 text-lg">{profileData.email}</p>
              {profileData.specialization && (
                <p className="text-blue-100 mb-4">Specialization: {profileData.specialization}</p>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onEdit}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 transition shadow-md"
              >
                Edit Profile
              </motion.button>
            </div>
          </div>

          {/* Right Section: Quick Stats */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5" />
                <span className="text-sm text-blue-100">Courses</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalCourses}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-5 h-5" />
                <span className="text-sm text-blue-100">Students</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalStudents}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5" />
                <span className="text-sm text-blue-100">Rating</span>
              </div>
              <p className="text-3xl font-bold">{(stats.rating || 0).toFixed(1)}</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-5 h-5" />
                <span className="text-sm text-blue-100">Points</span>
              </div>
              <p className="text-3xl font-bold">{stats.totalPoints}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
