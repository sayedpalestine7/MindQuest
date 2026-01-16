import { motion } from "framer-motion"
import { useNavigate } from "react-router"

export default function EnrolledCourses({ courses }) {
  const navigate = useNavigate()

  const handleContinueCourse = (courseId) => {
    navigate(`/student/coursePage/${courseId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 lg:grid-cols-2 gap-4"
    >
      {courses.map((course, i) => (
        <motion.div
          key={course._id || i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.03, y: -2 }}
          className="rounded-lg shadow-sm overflow-hidden border cursor-pointer"
          style={{ borderColor: '#E0E0E0', backgroundColor: '#FFFFFF' }}
        >
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 flex items-center justify-center" style={{ backgroundColor: '#F5F7FA' }}>
              <span className="text-5xl" style={{ color: '#9E9E9E' }}>📚</span>
            </div>
          )}
          <div className="p-4">
            <h4 className="font-semibold mb-2 text-base line-clamp-2" style={{ color: '#263238' }}>
              {course.title}
            </h4>
            <p className="text-xs mb-3" style={{ color: '#607D8B' }}>
              {course.completedLessons || 0} / {course.totalLessons || 0} lessons completed
            </p>
            <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: '#ECEFF1' }}>
              <motion.div
                className="h-2 rounded-full"
                style={{ backgroundColor: '#3F51B5' }}
                initial={{ width: 0 }}
                animate={{ width: `${course.progress}%` }}
                transition={{ duration: 0.8, delay: i * 0.1 }}
              />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold" style={{ color: '#3F51B5' }}>
                {course.progress}% Complete
              </span>
            </div>
            <button 
              onClick={() => handleContinueCourse(course._id)}
              className="w-full text-white py-2 rounded-md text-sm font-semibold transition-all shadow-sm"
              style={{ backgroundColor: '#3F51B5' }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#303F9F';
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 8px rgba(63, 81, 181, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#3F51B5';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)';
              }}
            >
              {course.progress === 100 ? "Review Course" : "Continue Learning"}
            </button>
          </div>
        </motion.div>
      ))}
    </motion.div>
  )
}
