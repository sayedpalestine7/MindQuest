import React from "react";
import { Clock, BookOpen, Eye } from 'lucide-react';
import { useNavigate } from "react-router";

export default function CourseCard({ course, enrolledCourses }) {
  const navigate = useNavigate();
  const courseId = course?.id || course?._id;
  
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
        <div className="text-sm text-gray-500 mb-2">
          <span className="badge badge-outline">
            {course.category}
          </span>
        </div>
        <div className="flex justify-between py-2">
          <div className="text-sm text-gray-500 mb-2 flex"><Clock className="scale-75"/>{course.duration}</div>
          <div className="text-sm text-gray-500 mb-2 flex"><BookOpen className="scale-75"/>{course.lessons} lessons</div>
        </div>

        <div className="mt-auto">
          <button
            onClick={() => navigate(`/student/coursePage/${courseId}`)}
            className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            {enrolledCourses.includes(courseId) ? "Continue" : "View Course"}
          </button>
        </div>
      </div>
    </div>
  );
}
