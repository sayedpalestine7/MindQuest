import React from "react"

export default function CourseDialog({ course, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500">✖</button>
        <h2 className="text-2xl font-semibold mb-2">{course.title}</h2>
        <img src={course.thumbnail || "/placeholder.svg"} alt={course.title} className="w-full h-64 object-cover rounded mb-3" />
        <p className="text-gray-700 mb-2">{course.description}</p>
        <p><strong>Teacher:</strong> {course.teacher.name}</p>
        <p><strong>Category:</strong> {course.category}</p>
        <p><strong>Status:</strong> {course.status}</p>
        <p><strong>Students:</strong> {course.studentsEnrolled}</p>
        <p><strong>Created:</strong> {new Date(course.createdAt).toLocaleDateString()}</p>
      </div>
    </div>
  )
}
