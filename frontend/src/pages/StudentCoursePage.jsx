// /src/pages/StudentCoursePage.jsx
import React, { useEffect, useState } from "react"
import StudentHeader from "../components/coursePage/StudentHeader"
import StudentSidebar from "../components/coursePage/StudentSidebar"
import LessonContent from "../components/coursePage/LessonContent"
import QuizModal from "../components/coursePage/QuizModal"

export default function StudentCoursePage() {
  /* -------------------- STATE -------------------- */
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isQuizOpen, setIsQuizOpen] = useState(false)

  /* -------------------- LOAD COURSE DATA -------------------- */
  useEffect(() => {
    // Load course and lessons saved by the teacher
    const saved = localStorage.getItem("course-data")
    const progress = localStorage.getItem("student-progress")
    if (saved) {
      const { course, lessons } = JSON.parse(saved)
      setCourse(course)
      setLessons(lessons)
      if (lessons.length > 0) {
        setCurrentLessonId(
          progress ? JSON.parse(progress).currentLessonId || lessons[0].id : lessons[0].id
        )
      }
    }

    // Restore student progress
    if (progress) {
      const { completedLessons: c, isDarkMode: d } = JSON.parse(progress)
      setCompletedLessons(c || [])
      setIsDarkMode(d || false)
    }
  }, [])

  /* -------------------- AUTO-SAVE PROGRESS -------------------- */
  useEffect(() => {
    const data = {
      currentLessonId,
      completedLessons,
      isDarkMode,
    }
    localStorage.setItem("student-progress", JSON.stringify(data))
  }, [currentLessonId, completedLessons, isDarkMode])

  /* -------------------- DARK MODE -------------------- */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode)
  }, [isDarkMode])

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

  /* -------------------- RENDER -------------------- */
  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600 dark:text-gray-300">
        <p>No course data found. Please create a course first.</p>
      </div>
    )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors">
      <StudentHeader
        courseTitle={course.title}
        progress={progress}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
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
