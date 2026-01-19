// /src/components/StudentHeader.jsx
import React, { useState, useEffect } from "react"
import { GraduationCap, Moon, Sun, RotateCcw } from "lucide-react"
import { useNavigate } from "react-router"
import axios from "axios"
import { Button } from "../courseBuilder/UI"

export default function StudentHeader({
  courseTitle,
  progress,
  onRestart,
  userAvatar,
  userName,
  userId,
}) {
  const navigate = useNavigate()
  const [imageError, setImageError] = useState(false)

  const getInitials = (name) => {
    if (!name) return "U"
    return name.charAt(0).toUpperCase()
  }

  const displayInitials = getInitials(userName)

  const handleAvatarClick = () => {
    if (userId) {
      navigate(`/student/${userId}`)
    }
  }

  // avatar state (initially try prop or localStorage)
  const [avatarSrcState, setAvatarSrcState] = useState(() => {
    if (userAvatar) return userAvatar
    try {
      const stored = localStorage.getItem("user")
      if (stored) {
        const parsed = JSON.parse(stored)
        return parsed?.profileImage || parsed?.avatar || ""
      }
    } catch (e) {
      // ignore
    }
    return ""
  })

  useEffect(() => {
    // if prop changes, prefer prop
    if (userAvatar) setAvatarSrcState(userAvatar)
  }, [userAvatar])

  useEffect(() => {
    // if we don't have an avatar but have userId, try fetching from backend
    const fetchAvatar = async () => {
      if (!avatarSrcState && userId) {
        try {
          const token = localStorage.getItem("token")
          const res = await axios.get(`http://localhost:5000/api/student/id/${userId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          })
          const data = res.data
          const src = data?.profileImage || data?.avatar || ""
          if (src) setAvatarSrcState(src)
        } catch (e) {
          // ignore fetch errors
        }
      }
    }
    fetchAvatar()
  }, [avatarSrcState, userId])

  return (
    <div className="mq-header">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Course Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl mq-header-logo flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold mq-header-title">
              {courseTitle || "Course"}
            </h1>
            <p className="text-xs mq-header-subtitle">
              Progress: {progress}%
            </p>
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-3">
          {/* Restart Course */}
          <Button
            onClick={onRestart}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>

          {/* Avatar with Profile Link */}
          <button
            onClick={handleAvatarClick}
            className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-transparent hover:border-blue-500 transition-all cursor-pointer"
            title={userName || "Profile"}
          >
            {!imageError && avatarSrcState ? (
              <img
                src={avatarSrcState}
                alt={userName || "User avatar"}
                className="w-full h-full object-cover"
                onError={() => {
                  console.log("Avatar image failed to load:", avatarSrcState)
                  setImageError(true)
                }}
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold text-sm">
                {displayInitials}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
