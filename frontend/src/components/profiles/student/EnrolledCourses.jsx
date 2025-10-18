
export default function EnrolledCourses({ courses }) {
  
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-xl font-bold mb-6">Enrolled Courses</h3>
      <div className="grid md:grid-cols-2 gap-4">
        {courses.map((course) => (
          <div key={course.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
            <img src={course.thumbnail} alt={course.title} className="w-full h-40 object-cover" />
            <div className="p-4">
              <h4 className="font-semibold mb-1">{course.title}</h4>
              <p className="text-sm text-gray-500 mb-3">
                {course.completedLessons} / {course.totalLessons} lessons
              </p>
              <div className="w-full bg-gray-200 h-2 rounded-full mb-3">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
                {course.progress === 100 ? "Review" : "Continue"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
