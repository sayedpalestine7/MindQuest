import React from "react";

export default function CourseCard({ course, enrolledCourses, handleEnroll }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "beginner": return "bg-green-100 text-green-700";
      case "intermediate": return "bg-yellow-100 text-yellow-700";
      case "advanced": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden shadow flex flex-col h-full">
      <div className="relative h-48">
        <img
          src={course.thumbnail || "/placeholder.svg"}
          alt={course.title}
          className="w-full h-full object-cover"
        />
        <span className={`absolute top-2 right-2 px-2 py-1 text-xs rounded ${getDifficultyColor(course.difficulty)}`}>
          {course.difficulty}
        </span>
      </div>

      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg mb-2">{course.title}</h3>
        <div className="text-sm text-gray-500 mb-2">{course.category}</div>
        <div className="text-sm text-gray-500 mb-2">{course.duration} • {course.lessons} lessons</div>

        <div className="mt-auto">
          {enrolledCourses.includes(course.id) ? (
            <button className="w-full py-2 bg-gray-200 text-gray-500 rounded" disabled>
              Enrolled
            </button>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              className="w-full py-2 bg-blue-500 text-white rounded"
            >
              Enroll Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
