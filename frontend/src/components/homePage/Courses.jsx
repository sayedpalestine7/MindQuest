import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Brain, Zap, Gamepad2, CheckCircle2, ArrowRight, Users, Star, Clock } from "lucide-react"
import axios from "axios"

const categoryIcons = {
  "Data Structures": <Brain className="w-12 h-12 text-blue-600" />,
  "Algorithms": <Zap className="w-12 h-12 text-purple-600" />,
  "Programming": <Gamepad2 className="w-12 h-12 text-pink-600" />,
  "Web Development": <Zap className="w-12 h-12 text-green-600" />,
  "Machine Learning": <Brain className="w-12 h-12 text-orange-600" />,
  "default": <Brain className="w-12 h-12 text-blue-600" />
}

const categoryColors = {
  "Data Structures": "from-blue-100 to-blue-50",
  "Algorithms": "from-purple-100 to-purple-50",
  "Programming": "from-pink-100 to-pink-50",
  "Web Development": "from-green-100 to-green-50",
  "Machine Learning": "from-orange-100 to-orange-50",
  "default": "from-gray-100 to-gray-50"
}

export default function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        setLoading(true)
        const response = await axios.get("http://localhost:5000/api/courses", {
          params: {
            limit: 6,
            sortBy: "popular", // or "newest"
            status: "approved"
          }
        })
        
        setCourses(response.data.courses || response.data || [])
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchTopCourses()
  }, [])

  const handleCourseClick = (courseId) => {
    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'course_click', {
        course_id: courseId,
        source: 'homepage'
      })
    }
    navigate(`/courses/${courseId}`)
  }

  const handleViewAllCourses = () => {
    // Track analytics
    if (window.gtag) {
      window.gtag('event', 'view_all_courses', {
        source: 'homepage'
      })
    }
    navigate("/courses")
  }

  if (loading) {
    return (
      <section id="courses" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-gray-600 mb-12">Explore our most popular courses</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-2 p-6 rounded-xl bg-white animate-pulse">
                <div className="aspect-video bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section id="courses" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-red-500 mb-4">Unable to load courses. Please try again later.</p>
        </div>
      </section>
    )
  }

  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
        <p className="text-gray-600 mb-12">Explore our most popular courses</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {courses.slice(0, 6).map((course) => {
            const icon = categoryIcons[course.category] || categoryIcons.default
            const color = categoryColors[course.category] || categoryColors.default
            
            return (
              <div 
                key={course._id} 
                onClick={() => handleCourseClick(course._id)}
                className="border-2 p-6 rounded-xl hover:shadow-lg bg-white transition cursor-pointer group"
              >
                <div className={`aspect-video bg-gradient-to-br ${color} rounded-lg mb-4 flex items-center justify-center overflow-hidden`}>
                  {course.thumbnail ? (
                    <img 
                      src={`http://localhost:5000${course.thumbnail}`} 
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    icon
                  )}
                </div>
                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition">{course.title}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>{course.lessonCount || course.lessons?.length || 0} Lessons</span>
                  </div>
                  {course.students && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{course.students}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-3 text-gray-500">
                    {course.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span className="capitalize">{course.difficulty || "Beginner"}</span>
                    </div>
                  </div>
                  <button className="text-blue-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explore <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        
        {courses.length > 0 && (
          <button 
            onClick={handleViewAllCourses}
            className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition font-medium"
          >
            View All {courses.length > 6 ? 'Courses' : `${courses.length} Courses`}
          </button>
        )}
      </div>
    </section>
  )
}
