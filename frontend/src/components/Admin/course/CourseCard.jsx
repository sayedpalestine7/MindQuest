import React from "react"
import { CalendarDays, Eye, Trash2, Upload, BookOpen , ChartColumnStacked } from "lucide-react"

export default function CourseCard({ course, onView, onToggle, onDelete }) {
  const createdDate = new Date(course.createdAt || Date.now()).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden bg-gray-900 text-gray-300 shadow-md hover:shadow-xl transition duration-300">
      {/* Thumbnail */}
      <div className="relative h-40 bg-gray-800">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs rounded capitalize ${
            course.status === "published"
              ? "bg-green-600 text-white"
              : "bg-gray-600 text-gray-200"
          }`}
        >
          {course.status}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 space-y-3">
        <h3 className="font-semibold text-lg truncate text-white">{course.title}</h3>
        <p className="text-sm text-gray-400 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center">
        <div className="text-sm text-gray-200 font-medium flex items-center gap-1">
          <BookOpen size={15} className="text-blue-400" />
          <span>By {course.teacher.name}</span>
        </div>
        
        <div className="text-sm text-gray-200 font-medium flex items-center gap-1">
          <ChartColumnStacked  size={15} className="text-blue-400" />
          <span>{course.category}</span>
        </div>
        </div>
        

        {/* Created At */}
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <CalendarDays size={14} className="text-gray-400" />
          <span>Created on {createdDate}</span>
        </div>

        {/* Stats */}
        <div className="flex justify-between text-sm text-gray-400 border-t border-gray-700 pt-2">
          <span className="flex items-center gap-1">
            👥 {course.studentsEnrolled}
            <span className="hidden sm:inline">Students</span>
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={14} className="text-gray-400" />
            {course.category}
          </span>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          {/* View */}
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center gap-1 border border-gray-600 py-1 rounded-md text-gray-200 hover:bg-gray-800 hover:text-white transition"
          >
            <Eye size={15} />
            View
          </button>

          {/* Publish / Unpublish */}
          <button
            onClick={onToggle}
            className={`flex-1 flex items-center justify-center gap-1 border py-1 rounded-md font-medium transition ${
              course.status === "published"
                ? "border-green-600 text-green-600 hover:bg-green-600/10"
                : "border-green-400 text-green-400 hover:bg-green-400/10"
            }`}
          >
            <Upload size={15} />
            {course.status === "published" ? "Unpublish" : "Publish"}
          </button>

          {/* Delete */}
          <button
            onClick={onDelete}
            className="flex-1 flex items-center justify-center gap-1 border border-red-500 text-red-500 py-1 rounded-md hover:bg-red-500/10 transition"
          >
            <Trash2 size={15} />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
