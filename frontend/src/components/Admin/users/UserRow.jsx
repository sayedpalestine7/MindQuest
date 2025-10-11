// src/components/admin/UserRow.jsx
import React from "react"
import { motion } from "framer-motion"
import { Eye, Ban, CheckCircle, XCircle } from "lucide-react"

function UserRow({ user, index, onView, onBan }) {
  // Generate initials for avatar fallback
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="hover:bg-base-200"
    >
      {/* Avatar */}
      <td>
        <div className="flex items-center space-x-3">
          <div className="avatar">
            <div className="mask mask-squircle h-12 w-12">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <div className="bg-neutral text-neutral-content flex h-12 w-12 items-center justify-center rounded-full">
                  <span className="text-sm font-bold">
                    {getInitials(user.name)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </td>

      {/* Name */}
      <td className="font-bold">{user.name}</td>

      {/* Email */}
      <td className="text-base-content/70">{user.email}</td>

      {/* Progress */}
      <td>
        <div className="flex items-center gap-3">
          <progress 
            className="progress progress-primary w-20" 
            value={user.progress} 
            max="100"
          ></progress>
          <span className="text-sm text-base-content/70">{user.progress}%</span>
        </div>
      </td>

      {/* Points */}
      <td>
        <div className="badge badge-outline font-mono badge-lg">
          {user.points.toLocaleString()}
        </div>
      </td>

      {/* Status */}
      <td>
        {user.status === "active" ? (
          <div className="badge badge-success gap-2">
            <CheckCircle className="h-3 w-3" />
            Active
          </div>
        ) : (
          <div className="badge badge-error gap-2">
            <XCircle className="h-3 w-3" />
            Banned
          </div>
        )}
      </td>

      {/* Actions */}
      <td>
        <div className="flex justify-end gap-2">
          <button
            onClick={onView}
            className="btn btn-ghost btn-sm gap-2"
          >
            <Eye className="h-4 w-4" />
            View
          </button>
          <button
            onClick={onBan}
            className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error hover:text-error-content"
          >
            <Ban className="h-4 w-4" />
            {user.status === "banned" ? "Unban" : "Ban"}
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

export default UserRow