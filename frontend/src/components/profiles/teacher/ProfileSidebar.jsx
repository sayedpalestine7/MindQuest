"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Star, Trophy, Edit2, X } from "lucide-react";

export default function ProfileSidebar({ profileData, stats, onEdit, onClose }) {
  const statsArray = [
    { title: "Courses", value: stats.totalCourses, icon: BookOpen, progress: (stats.totalCourses / 20) * 100 },
    { title: "Students", value: stats.totalStudents, icon: Users, progress: (stats.totalStudents / 100) * 100 },
    { title: "Rating", value: (stats.rating || 0).toFixed(1), icon: Star, progress: ((stats.rating || 0) / 5) * 100 },
    { title: "Points", value: stats.totalPoints, icon: Trophy, progress: Math.min((stats.totalPoints / 1000) * 100, 100) },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Close button for mobile */}
      <div className="md:hidden flex justify-between items-center p-6 border-b border-gray-100">
        <h2 className="text-xl font-bold text-gray-900">Profile</h2>
        <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      {/* Profile Section */}
      <div className="p-8 border-b border-gray-100">
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          {profileData.avatar ? (
            <img
              src={profileData.avatar}
              alt="avatar"
              className="w-28 h-28 rounded-2xl object-cover shadow-sm"
            />
          ) : (
            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center shadow-sm">
              <span className="text-5xl font-bold text-blue-600">{profileData.name?.charAt(0).toUpperCase()}</span>
            </div>
          )}
        </motion.div>

        {/* Name & Email */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{profileData.name}</h1>
        <p className="text-sm text-gray-600 mb-4 truncate">{profileData.email}</p>

        {/* Specialization */}
        {profileData.specialization && (
          <p className="text-sm text-gray-700 font-medium mb-6 pb-6 border-b border-gray-100">{profileData.specialization}</p>
        )}

        {/* Edit Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onEdit}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl font-semibold transition-colors shadow-sm"
        >
          <Edit2 size={18} /> Edit Profile
        </motion.button>
      </div>

      {/* Stats Section */}
      <div className="flex-1 p-8 space-y-4 overflow-y-auto">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Statistics</h3>
        {statsArray.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, duration: 0.3 }}
              className="bg-white border border-gray-100 rounded-xl p-5 hover:border-gray-200 hover:shadow-sm transition-all"
            >
              {/* Icon + Title */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon size={18} className="text-blue-600" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{stat.title}</span>
                </div>
                <span className="text-xl font-bold text-gray-900">{stat.value}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(stat.progress, 100)}%` }}
                  transition={{ duration: 0.8, delay: 0.2 + 0.05 * i }}
                  className="h-full bg-blue-600 rounded-full"
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
