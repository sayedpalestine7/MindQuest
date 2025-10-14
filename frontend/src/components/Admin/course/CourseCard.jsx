import React from "react"

export default function CourseCard({ course, onView, onToggle, onDelete }) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition">
      <div className="relative h-40 bg-gray-100">
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="w-full h-full object-cover" />
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${
            course.status === "published" ? "bg-green-500 text-white" : "bg-gray-300"
          }`}
        >
          {course.status}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg truncate">{course.title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-2">{course.description}</p>
        <p className="text-sm text-gray-600 mb-2">👩‍🏫 {course.teacher.name}</p>
        <div className="flex justify-between text-sm text-gray-500 mb-4">
          <span>👥 {course.studentsEnrolled}</span>
          <span>📚 {course.category}</span>
        </div>

        <div className="flex gap-2">
          <button onClick={onView} className="flex-1 border p-1 rounded hover:bg-gray-100">👁 View</button>
          <button onClick={onToggle} className="flex-1 border p-1 rounded hover:bg-gray-100">
            {course.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button onClick={onDelete} className="flex-1 border p-1 rounded text-red-500 hover:bg-red-50">
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}
