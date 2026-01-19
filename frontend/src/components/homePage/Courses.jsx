import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router"
import axios from "axios"
import CourseCard from "../courseBrowse/CourseCard"
import CourseCardSkeleton from "../courseBrowse/CourseCardSkeleton"

export default function Courses() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTopCourses = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams({
          page: 1,
          limit: 6,
          sortBy: "popular"
        })

        const response = await axios.get(`http://localhost:5000/api/courses?${params}`)

        const coursesData = Array.isArray(response.data?.courses)
          ? response.data.courses
          : Array.isArray(response.data)
            ? response.data
            : []

        const totalFromApi = response.data?.pagination?.total
        const total = (typeof totalFromApi === "number" && totalFromApi > 0)
          ? totalFromApi
          : coursesData.length

        setCourses(coursesData)
        setTotalCourses(total)
      } catch (err) {
        console.error("Error fetching courses:", err)
        setError(err.message)
        setTotalCourses(0)
      } finally {
        setLoading(false)
      }
    }

    fetchTopCourses()
  }, [])

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} index={i} />
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
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
          <p className="text-gray-600 mb-12">Explore our most enrolled courses</p>
        </div>

        {!loading && !error && courses.length > 0 && (
          <p className="text-gray-600 mt-6 mb-4 text-center">
            Showing <span className="font-semibold text-gray-900">{courses.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{totalCourses}</span> courses
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8 items-stretch">
          {courses
            .slice(0, 6)
            .map((course, index) => (
            <CourseCard
              key={course._id}
              course={{
                id: course._id,
                title: course.title,
                description: course.description,
                thumbnail:
                  course.thumbnail ||
                  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1170&q=80",
                instructor: course.teacherId?.name || "Unknown Instructor",
                teacherId: course.teacherId?._id,
                rating: course.averageRating || course.rating || 0,
                ratingCount: course.ratingCount || 0,
                students: course.enrollmentCount || course.students || 0,
                duration: course.duration || "Self-paced",
                lessons:
                  course.lessons ??
                  course.lessonsCount ??
                  course.lessonIds?.length ??
                  0,
                lessonTitles:
                  (Array.isArray(course.lessonTitles) && course.lessonTitles.length > 0)
                    ? course.lessonTitles
                    : Array.isArray(course.lessons)
                      ? course.lessons.map((l) => l?.title).filter(Boolean).slice(0, 3)
                      : [],
                difficulty: course.difficulty || "Beginner",
                category: course.category || "General",
                price: course.price > 0 ? `$${course.price}` : "Free",
                tags: course.tags || [],
              }}
              index={index}
              enrolledCourses={[]}
              handleEnroll={() => {}}
            />
          ))}
        </div>

        {courses.length > 0 && (
          <div className="text-center">
            <button
              onClick={handleViewAllCourses}
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition font-medium"
            >
              View All Courses
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
