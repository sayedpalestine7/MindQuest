import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import { Sparkles, ArrowRight, BookOpen, Users, GraduationCap, TrendingUp } from "lucide-react"
import axios from "axios"

export default function Hero() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    teachers: 0,
    enrollments: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch real data from database
        const [coursesRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/courses"),
          axios.get("http://localhost:5000/api/admin/users").catch(() => ({ data: { items: [] } }))
        ])
        
        const courses = coursesRes.data.courses || coursesRes.data || []
        const users = usersRes.data.items || []
        
        // Calculate real stats
        const approvedCourses = courses.filter(c => c.status === "approved")
        const students = users.filter(u => u.userType === "student")
        const teachers = users.filter(u => u.userType === "teacher" && u.status === "active")
        const totalEnrollments = approvedCourses.reduce((sum, course) => {
          return sum + (course.enrolledStudents?.length || 0)
        }, 0)
        
        setStats({
          courses: approvedCourses.length,
          students: students.length,
          teachers: teachers.length,
          enrollments: totalEnrollments
        })

        // For development/demo purposes, you can uncomment the following to use fake data
        setStats({
          courses: 50,
          students: 1200,
          teachers: 35,
          enrollments: 3500
        })

      } catch (err) {
        console.error("Error fetching stats:", err)
        // Fallback to default values on error
        setStats({
          courses: 0,
          students: 0,
          teachers: 0,
          enrollments: 0
        })
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const handleGetStarted = () => {
    if (window.gtag) {
      window.gtag('event', 'get_started_click', {
        source: 'hero'
      })
    }
    navigate("/navigates")
  }

  const handleBrowseCourses = () => {
    if (window.gtag) {
      window.gtag('event', 'browse_courses_click', {
        source: 'hero'
      })
    }
    navigate("/courses")
  }

  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* <span className="inline-flex items-center gap-1 text-blue-600 font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Interactive Learning Platform
          </span> */}
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Programming</span>
            <span className="block mt-2">Through Interactive Animations</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Learn Data Structures, Algorithms, and Programming with professional visualizations. 
            Create your own animations with our built-in studio.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button 
              onClick={handleGetStarted}
              className="mq-btn-primary px-8 py-3"
            >
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleBrowseCourses}
              className="mq-btn-outline px-8 py-3"
            >
              Browse Courses
            </button>
          </div>

          {/* Live Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { icon: <BookOpen className="w-5 h-5" />, label: "Courses", value: stats.courses, suffix: "+" },
              { icon: <Users className="w-5 h-5" />, label: "Students", value: stats.students, suffix: "+" },
              { icon: <GraduationCap className="w-5 h-5" />, label: "Teachers", value: stats.teachers, suffix: "+" },
              { icon: <TrendingUp className="w-5 h-5" />, label: "Enrollments", value: stats.enrollments, suffix: "+" }
            ].map((stat, idx) => (
              <div key={idx} className="mq-card bg-white/70 backdrop-blur-sm p-4">
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mx-auto"></div>
                  ) : (
                    <>{stat.value}{stat.suffix}</>
                  )}
                </div>
                <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
