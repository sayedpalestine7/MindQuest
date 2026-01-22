import React from "react";
import { motion } from "framer-motion";

/**
 * UserSummaryHeader - Top section showing profile image and user info
 * Acts as persistent identity header for the dashboard
 */
export default function UserSummaryHeader({ profileData, stats, onEdit }) {
  const { name, email, bio, avatar, expertise } = profileData || {};

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4"
    >
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Profile Image */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg border-2 border-slate-200">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold bg-blue-600">
                {name?.charAt(0)?.toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start mb-1">
            <h1 className="text-2xl font-bold text-slate-800">{name}</h1>
            <button
              onClick={onEdit}
              className="btn btn-sm btn-ghost btn-circle text-emerald-600"
              aria-label="Edit profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          </div>
          <p className="mb-1 text-slate-500">{email}</p>
          {expertise && (
            <span className="inline-block text-sm px-3 py-1 rounded-full font-medium bg-blue-50 text-blue-600">
              {expertise}
            </span>
          )}
          {bio && <p className="mt-3 max-w-2xl text-slate-500">{bio}</p>}
        </div>
      </div>
    </motion.div>
  );
}
