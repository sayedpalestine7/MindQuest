import React from "react"
import { motion } from "framer-motion"

export default function ProfileHeader({ profileData, stats, onEdit }) {
  // Default avatar if no profile image
  const defaultAvatar = "https://static.thenounproject.com/png/5100711-200.png";
  // Check both avatar and profileImage fields (avatar is used in parent state)
  const avatarSrc = profileData.avatar || profileData.profileImage || defaultAvatar;

  // console.log("ProfileHeader - profileData:", profileData);
  // console.log("ProfileHeader - avatarSrc:", avatarSrc);

  return (
    <motion.div
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <img
            key={avatarSrc} // Force re-render when image changes
            src={avatarSrc}
            alt={`${profileData.name}'s avatar`}
            className="w-28 h-28 rounded-full border-4 border-blue-600 object-cover"
            onError={(e) => {
              // Fallback if image fails to load
              e.target.src = defaultAvatar;
            }}
          />
          <div>
            <h2 className="text-2xl font-bold">{profileData.name}</h2>
            <p className="text-gray-500">{profileData.email}</p>
            <button
              onClick={onEdit}
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          </div>
        </div>

        <div className="text-center md:text-right">
          <div className="flex justify-center text-center md:text-right p-10">
            <p className="text-3xl font-bold text-blue-600">Total Points:</p>
            <p className="text-3xl font-bold text-blue-600">{stats.totalPoints}</p>
          </div>

        </div>
      </div>
    </motion.div>
  )
}