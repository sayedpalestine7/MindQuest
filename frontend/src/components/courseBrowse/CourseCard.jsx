import { motion } from "framer-motion"
import { Star, Users, Clock, BookOpen, CheckCircle2, Eye } from "lucide-react"
import { Link, useNavigate } from "react-router"

export default function CourseCard({ course, index, enrolledCourses, handleEnroll, canAccessCourse }) {
  const navigate = useNavigate()
  const courseId = course?._id || course?.id
  const actionDisabled = !canAccessCourse
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
      className="mq-card mq-card-hover overflow-hidden flex flex-col h-full"
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
          {(course.averageRating > 0 || course.rating > 0) ? (
            <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-semibold">
                {(course.averageRating || course.rating).toFixed(1)}
              </span>
              {(course.ratingCount > 0) && (
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
            <span className="text-sm">
              {(course.enrollmentCount || course.students || 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Category badge - fixed height */}
        <div className="mb-2">
          <span className="inline-block border px-2 py-1 rounded text-xs text-gray-700">
            {course.category}
          </span>
        </div>

        {/* Title - fixed 2 lines */}
        <h3 className="font-bold text-base mb-2 line-clamp-2 h-6">{course.title}</h3>
        
        {/* Description - fixed 2 lines */}
        <p className="text-sm text-gray-600 line-clamp-2 h-10 mb-3">{course.description}</p>

        {/* Instructor - fixed height */}
        <div className="h-6 mb-2">
          {course.teacherId ? (
            <Link
              to={`/instructor/${course.teacherId}`}
              className="text-sm text-blue-600 hover:underline font-medium inline-block truncate"
            >
              By {course.instructor}
            </Link>
          ) : (
            <span className="text-sm text-gray-600 font-medium inline-block truncate">
              By {course.instructor}
            </span>
          )}
        </div>

        {/* Lesson Titles - fixed height */}
        <div className="h-6 mb-2">
          {course.lessonTitles && course.lessonTitles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.lessonTitles.slice(0, 3).map((title, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs line-clamp-1"
                >
                  {title}
                </span>
              ))}
            </div>
          )}
        </div>
          
        {/* Course stats - fixed height */}
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
          {/* <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{course.duration}</span>
          </div> */}
          <div className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessons} lessons</span>
          </div>
        </div>


        <div className="mt-auto pt-4 border-t flex items-center justify-between">
          <span className="text-lg font-bold text-blue-600">{course.price}</span>
          {enrolledCourses.includes(courseId) ? (
            <button
              onClick={actionDisabled ? undefined : () => navigate(`/student/coursePage/${courseId}`)}
              disabled={actionDisabled}
              aria-disabled={actionDisabled}
              className={`mq-btn-primary px-8 py-3 ${actionDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Continue
            </button>
          ) : (
            <button
              onClick={actionDisabled ? undefined : () => navigate(`/student/coursePage/${courseId}`)}
              disabled={actionDisabled}
              aria-disabled={actionDisabled}
              className={`mq-btn-primary px-4 py-3 ${actionDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              <Eye className="w-4 h-4" />
              View Course
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}
