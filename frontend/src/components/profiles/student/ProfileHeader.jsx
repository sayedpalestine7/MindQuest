import React from "react"

export default function ProfileHeader({ profileData, stats, onEdit }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <img
          src={profileData.avatar}
          alt="avatar"
          className="w-28 h-28 rounded-full border-4 border-blue-600 object-cover"
        />
        <div>
          <h2 className="text-2xl font-bold">{profileData.name}</h2>
          <p className="text-gray-500">{profileData.email}</p>
          <button
            onClick={onEdit}
            className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Edit Profile
          </button>
        </div>
      </div>

      <div className="text-center md:text-right">
        <p className="text-sm text-gray-500">Total Points</p>
        <p className="text-3xl font-bold text-blue-600">{stats.totalPoints}</p>
      </div>
    </div>
  )
}
