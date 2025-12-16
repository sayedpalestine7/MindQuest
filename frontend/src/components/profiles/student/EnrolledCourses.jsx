import { motion } from "framer-motion"
import { useNavigate } from "react-router"

export default function EnrolledCourses({ courses }) {
  const navigate = useNavigate()

  const handleContinueCourse = (courseId) => {
    navigate(`/student/coursePage/${courseId}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-white rounded-xl shadow p-6 ">
        <h3 className="text-xl font-bold mb-6">Enrolled Courses</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {courses.map((course, i) => (

            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
            >
              <div key={course.id} className="border shadow-sm rounded-lg overflow-hidden hover:shadow-lg transition">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
                ) : (
                  <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">No thumbnail</span>
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-semibold mb-1">{course.title}</h4>
                  <p className="text-sm text-gray-500 mb-3">
                    {course.completedLessons || 0} / {course.totalLessons || 0} lessons
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <button 
                    onClick={() => handleContinueCourse(course._id)}
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                  >
                    {course.progress === 100 ? "Review" : "Continue"}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
