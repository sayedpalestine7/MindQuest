// /src/pages/StudentCoursePage.jsx
import React, { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router"
import StudentHeader from "../components/coursePage/StudentHeader"
import StudentSidebar from "../components/coursePage/StudentSidebar"
import LessonContent from "../components/coursePage/LessonContent"
import QuizModal from "../components/coursePage/QuizModal"
import courseService from "../services/courseService"

export default function StudentCoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  /* -------------------- STATE -------------------- */
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(null)

  /* -------------------- GET STUDENT ID FROM AUTH -------------------- */
  useEffect(() => {
    const auth = localStorage.getItem("auth")
    if (auth) {
      const { userId } = JSON.parse(auth)
      setStudentId(userId)
    }
  }, [])

  /* -------------------- LOAD COURSE DATA -------------------- */
  useEffect(() => {
    const loadCourseData = async () => {
      setLoading(true)

      if (courseId) {
        // Load specific course by ID from backend
        const res = await courseService.getCourseById(courseId)
        if (res.success) {
          const full = res.data
          // Convert populated lesson/field structure into { id, title, fields[] }
          const lessonsData = (full.lessonIds || []).map((l) => ({
            id: l._id,
            title: l.title,
            fields: (l.fieldIds || []).map((f) => ({
              id: f._id || f.id,
              type: f.type,
              content: f.content,
              animationId: f.animationId || null,
            })),
          }))

          const courseData = {
            id: full._id,
            title: full.title,
            description: full.description,
            difficulty: full.difficulty,
            finalQuiz: full.quizId,
          }

          setCourse(courseData)
          setLessons(lessonsData)
          if (lessonsData.length > 0) {
            setCurrentLessonId(lessonsData[0].id)
          }

          // Restore student progress if exists
          const progress = localStorage.getItem("student-progress")
          if (progress) {
            const { completedLessons: c, currentLessonId: cId } = JSON.parse(progress)
            setCompletedLessons(c || [])
            if (cId) setCurrentLessonId(cId)
          }
        } else {
          console.error("Failed to load course:", res.error)
        }
      } else {
        // Fetch available courses from backend so student can enroll
        const res = await courseService.getAllCourses()
        if (res.success) {
          setCourses(res.data || [])
        } else {
          console.error("Failed to load courses:", res.error)
        }
      }

      setLoading(false)
    }

    loadCourseData()
  }, [courseId])

  /* -------------------- AUTO-SAVE PROGRESS -------------------- */
  useEffect(() => {
    const data = {
      currentLessonId,
      completedLessons,
    }
    localStorage.setItem("student-progress", JSON.stringify(data))
  }, [currentLessonId, completedLessons])


  /* -------------------- HELPERS -------------------- */
  const currentLesson = lessons.find((l) => l.id === currentLessonId)
  const progress = lessons.length
    ? Math.round((completedLessons.length / lessons.length) * 100)
    : 0

  const handleLessonComplete = () => {
    if (!currentLessonId) return
    if (!completedLessons.includes(currentLessonId)) {
      const updated = [...completedLessons, currentLessonId]
      setCompletedLessons(updated)

      // If last lesson, open final quiz automatically
      if (updated.length === lessons.length) {
        setTimeout(() => setIsQuizOpen(true), 500)
      } else {
        // Go to next lesson
        const currentIdx = lessons.findIndex((l) => l.id === currentLessonId)
        const next = lessons[currentIdx + 1]
        if (next) setCurrentLessonId(next.id)
      }
    }
  }

  const handleRestartCourse = () => {
    setCompletedLessons([])
    setCurrentLessonId(lessons[0]?.id || null)
    setIsQuizOpen(false)
    localStorage.removeItem("student-progress")
  }

  const handleEnrollCourse = async (courseId) => {
    if (!studentId) {
      alert("Please log in first")
      return
    }

    const enrolled = await courseService.enrollCourse(studentId, courseId)
    if (enrolled.success) {
      alert("Successfully enrolled! Loading course...")
      navigate(`/student/coursePage/${courseId}`)
    } else {
      alert(enrolled.error || "Failed to enroll")
    }
  }

  /* -------------------- RENDER -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }

  // If no course selected, show available courses to enroll
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="max-w-4xl w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => (
                <div key={c._id} className="p-4 border-2 rounded-lg bg-white">
                  <h3 className="font-semibold">{c.title}</h3>
                  <p className="text-sm text-gray-600">{c.description}</p>
                  <p className="text-xs text-gray-500 mt-2">Difficulty: {c.difficulty}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => handleEnrollCourse(c._id)}
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-black-20 transition-colors">
      <StudentHeader
        courseTitle={course.title}
        progress={progress}
        onRestart={handleRestartCourse}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          <StudentSidebar
            lessons={lessons}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            onSelectLesson={setCurrentLessonId}
            progress={progress}
          />

          <main className="flex-1 space-y-6">
            <LessonContent
              lesson={currentLesson}
              completed={completedLessons.includes(currentLessonId)}
              onCompleteLesson={handleLessonComplete}
            />
          </main>
        </div>
      </div>

      {/* Final Quiz Modal */}
      {isQuizOpen && course.finalQuiz && (
        <QuizModal quiz={course.finalQuiz} onClose={() => setIsQuizOpen(false)} />
      )}
    </div>
  )
}
