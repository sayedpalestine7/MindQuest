// /src/components/courseBuilder/Breadcrumb.jsx
import React from "react"
import { ChevronRight } from "lucide-react"

/**
 * Breadcrumb navigation component showing current location in course builder
 */
export default function Breadcrumb({
  courseTitle,
  lessonTitle,
  activeTab,
}) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 mb-6">
      {/* Course Home */}
      <span className="font-semibold text-gray-900">
        📚 Course Builder
      </span>

      {/* Course Title */}
      {courseTitle && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-gray-700">
            {courseTitle || "Untitled Course"}
          </span>
        </>
      )}

      {/* Active Tab / Lesson */}
      {activeTab === "lessons" && lessonTitle && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-blue-600 font-semibold">
            {lessonTitle}
          </span>
        </>
      )}

      {activeTab === "quiz" && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-yellow-600 font-semibold">
            Final Quiz
          </span>
        </>
      )}

      {activeTab === "ai" && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <span className="text-purple-600 font-semibold">
            AI Tools
          </span>
        </>
      )}
    </nav>
  )
}
