import React from "react";
import { Clock, BookOpen, Eye } from 'lucide-react';
import { useNavigate } from "react-router";

export default function CourseCard({ course, enrolledCourses }) {
  const navigate = useNavigate();
  const courseId = course?.id || course?._id;
  const lessonsCount =
    // course.lessons might be an array or a number depending on API
    (Array.isArray(course?.lessons) && course.lessons.length) ||
    (Array.isArray(course?.lessonIds) && course.lessonIds.length) ||
    course?.totalLessons ||
    course?.lessonsCount ||
    0;
  
  const getDifficultyColor = (difficulty) => {
    const d = typeof difficulty === "string" ? difficulty.trim().toLowerCase() : "";

    if (!d) return "bg-gray-100 text-gray-700";

    if (d.includes("begin") || d.includes("easy")) return "bg-green-100 text-green-700";
    if (d.includes("inter") || d.includes("medium")) return "bg-yellow-100 text-yellow-700";
    if (d.includes("adv") || d.includes("hard")) return "bg-red-100 text-red-700";

    return "bg-gray-100 text-gray-700";
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
          <div className="text-sm text-gray-500 mb-2 flex"></div>
          <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
            <BookOpen className="scale-75" />
            <span>{lessonsCount} {lessonsCount === 1 ? 'lesson' : 'lessons'}</span>
          </div>
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
