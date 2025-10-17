// /src/components/StudentHeader.jsx
import React from "react"
import { GraduationCap, Moon, Sun, RotateCcw } from "lucide-react"
import { Button } from "../courseBuilder/UI"

export default function StudentHeader({
  courseTitle,
  progress,
  isDarkMode,
  setIsDarkMode,
  onRestart,
}) {
  return (
    <header className="sticky top-0 z-20 border-b-2 border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: Course Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {courseTitle || "Course"}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
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

          {/* Dark Mode */}
          <Button
            onClick={() => setIsDarkMode(!isDarkMode)}
            variant="outline"
            size="sm"
            className="bg-transparent"
          >
            {isDarkMode ? (
              <Sun className="w-4 h-4 text-yellow-400" />
            ) : (
              <Moon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            )}
          </Button>

          {/* Avatar placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-semibold">
            S
          </div>
        </div>
      </div>
    </header>
  )
}
