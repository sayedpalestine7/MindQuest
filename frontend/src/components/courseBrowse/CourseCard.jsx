import { motion } from "framer-motion"
import { Star, Users, Clock, BookOpen, CheckCircle2, Plus } from "lucide-react"
import { Link } from "react-router"

export default function CourseCard({ course, index, enrolledCourses, handleEnroll }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-700"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "Advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-xl overflow-hidden border hover:shadow-lg transition flex flex-col h-full"
    >
      <div className="relative h-48 overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span
          className={`absolute top-3 right-3 px-2 py-1 text-xs font-semibold rounded ${getDifficultyColor(
            course.difficulty
          )}`}
        >
          {course.difficulty}
        </span>
        <div className="absolute bottom-3 left-3 flex gap-3 text-white">
          {course.rating > 0 ? (
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">{course.rating.toFixed(1)}</span>
              {course.ratingCount > 0 && (
                <span className="text-xs text-gray-300">({course.ratingCount})</span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">New</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
            <Users className="w-4 h-4" />
            <span className="text-sm">{course.students > 0 ? course.students.toLocaleString() : '0'}</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        {/* Category badge - fixed height */}
        <div className="mb-2">
          <span className="inline-block border px-2 py-1 rounded text-xs text-gray-700">
            {course.category}
          </span>
        </div>

        {/* Title - fixed 2 lines */}
        <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">{course.title}</h3>
        
        {/* Description - fixed 3 lines */}
        <p className="text-sm text-gray-600 line-clamp-3 h-[60px] mb-3">{course.description}</p>

        {/* Instructor - fixed height */}
        <div className="mb-2 h-6">
          {course.teacherId ? (
            <Link
              to={`/instructor/${course.teacherId}`}
              className="text-sm text-indigo-600 hover:underline font-medium inline-block truncate"
            >
              By {course.instructor}
            </Link>
          ) : (
            <span className="text-sm text-gray-600 font-medium inline-block truncate">
              By {course.instructor}
            </span>
          )}
        </div>

        {/* Tags - fixed height */}
        <div className="h-7 mb-3">
          {course.tags && course.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Course stats - fixed height */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <span className="text-lg font-bold text-indigo-600">{course.price}</span>
          {enrolledCourses.includes(course.id) ? (
            <button
              disabled
              className="flex items-center gap-1 border border-gray-300 px-3 py-1 rounded text-gray-500 bg-gray-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              Enrolled
            </button>
          ) : (
            <button
              onClick={() => handleEnroll(course.id)}
              className="flex items-center gap-1 bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4" />
              Enroll
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
