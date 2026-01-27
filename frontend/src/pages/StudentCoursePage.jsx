// /src/pages/StudentCoursePage.jsx
import React, { useEffect, useState } from "react"
import { useParams, useNavigate, useLocation } from "react-router"
import StudentHeader from "../components/coursePage/StudentHeader"
import AppHeader from "../components/shared/AppHeader"
import StudentSidebar from "../components/coursePage/StudentSidebar"
import LessonContent from "../components/coursePage/LessonContent"
import QuizModal from "../components/coursePage/QuizModal"
import courseService from "../services/courseService"
import { useAuth } from "../context/AuthContext"

export default function StudentCoursePage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  // Use a ref to track if we've already loaded progress from DB
  const progressLoadedRef = React.useRef(false)
  // Ref to avoid overlapping saves
  const inFlightSaveRef = React.useRef(false)
  // Initialize studentId synchronously to avoid effect ordering races
  /* -------------------- STATE -------------------- */
  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [studentId, setStudentId] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        return parsed?._id || parsed?.id || localStorage.getItem("userId") || null
      }
    } catch (e) {
      // Ignore parse errors and fall back
    }
    return localStorage.getItem("userId") || null
  })

  // Sync studentId from AuthContext when available (handles login timing)
  useEffect(() => {
    if (!studentId && user) {
      const id = user._id || user.id || null
      if (id) setStudentId(id)
    }
  }, [user, studentId])
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(true)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)

  /* -------------------- STORAGE KEY (namespaced per student+course) -------------------- */
  const storageKey = React.useMemo(() => {
    return studentId && courseId ? `student-progress:${studentId}:${courseId}` : null
  }, [studentId, courseId])

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
            id: String(l._id),
            title: l.title,
            fields: (l.fieldIds || []).map((f) => {
              // Initialize content for table fields if missing
              let content = f.content;
              if (f.type === "table" && (!content || typeof content !== "object" || !content.data)) {
                content = {
                  rows: 3,
                  columns: 3,
                  data: Array(3).fill(null).map(() => Array(3).fill(""))
                };
              }
              
              return {
                id: String(f._id || f.id),
                type: f.type,
                content: content,
                animationId: f.animationId || null,
                // include potential correct answer fields from backend
                correctAnswer: f.correctAnswer ?? f.answer ?? "",
                explanation: f.explanation ?? "",
              };
            }),
          }))

          // Handle quiz data - should be populated by backend
          let quizData = null
          if (full.quizId) {
            if (typeof full.quizId === "string") {
              // If it's just an ID string, fetch the full quiz data
              try {
                const qRes = await courseService.getQuizzesByCourse(full._id)
                if (qRes.success && Array.isArray(qRes.data)) {
                  const foundQuiz = qRes.data.find((q) => q._id === full.quizId || q.id === full.quizId) || qRes.data[0] || null
                  if (foundQuiz) {
                    // Transform populated questionIds into the shape expected by QuizModal
                    quizData = {
                      ...foundQuiz,
                      questions: (foundQuiz.questionIds || []).map((q) => ({
                        id: q._id || q.id,
                        type: q.type || 'mcq',
                        question: q.text || q.question || '',
                        options: Array.isArray(q.options) ? q.options : [],
                        correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
                        correctAnswer: q.correctAnswer || '',
                        points: q.points || 1,
                        explanation: q.explanation || '',
                      }))
                    }
                  }
                }
              } catch (e) {
                console.error("Failed fetching quiz details:", e)
                quizData = null
              }
            } else {
              // It's already the populated quiz object from backend
              // Transform questionIds to the shape expected by QuizModal
              quizData = {
                ...full.quizId,
                questions: (full.quizId.questionIds || []).map((q) => ({
                  id: q._id || q.id,
                  type: q.type || 'mcq',
                  question: q.text || q.question || '',
                  options: Array.isArray(q.options) ? q.options : [],
                  correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
                  correctAnswer: q.correctAnswer || '',
                  points: q.points || 1,
                  explanation: q.explanation || '',
                }))
              }
            }
          }

          const courseData = {
            id: full._id,
            title: full.title,
            description: full.description,
            difficulty: full.difficulty,
            price: full.price ?? 0,
            finalQuiz: quizData,
          }

          setCourse(courseData)
          setLessons(lessonsData)
          // Avoid setting current lesson immediately — wait for progress
          // hydration (localStorage or DB) which may override this.
          if (!storageKey && lessonsData.length > 0) {
            setCurrentLessonId(lessonsData[0].id)
          }

          // Check enrollment when studentId available
          if (studentId) {
            try {
              const enrollRes = await courseService.getEnrolledCourses(studentId)
              if (enrollRes.success && Array.isArray(enrollRes.data)) {
                const enrolledIds = enrollRes.data.map(c => c._id || c.id)
                setEnrolledCourseIds(enrolledIds)
                setIsEnrolled(enrolledIds.includes(full._id))
              } else {
                setIsEnrolled(false)
              }
            } catch (e) {
              console.error("Failed checking enrollment:", e)
              setIsEnrolled(false)
            }
          } else {
            setIsEnrolled(false)
          }

          // Restore student progress if exists (namespaced)
          if (storageKey) {
            const progress = localStorage.getItem(storageKey)
            if (progress) {
              const { completedLessons: c, currentLessonId: cId } = JSON.parse(progress)
              if (Array.isArray(c) && c.length > 0) {
                const normalized = Array.from(new Set(c.map((id) => String(id))))
                // keep only ids that exist in the loaded lessons
                const valid = normalized.filter((id) => lessonsData.some((l) => String(l.id) === id))
                setCompletedLessons(valid)
              }
              // validate restored currentLessonId exists in lessons
              if (cId && lessonsData.some(l => l.id === String(cId))) setCurrentLessonId(String(cId))
            }
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
        // Fetch enrolled courses (used on course listing)
        if (studentId) {
          const enrollRes = await courseService.getEnrolledCourses(studentId)
          if (enrollRes.success && enrollRes.data) {
            const enrolledIds = enrollRes.data.map(c => c._id || c.id)
            setEnrolledCourseIds(enrolledIds)
          }
        }
      }

      setLoading(false)
    }

    loadCourseData()
  }, [courseId, studentId])

  /* -------------------- LOAD PROGRESS FROM DATABASE -------------------- */
  useEffect(() => {
    // Only load progress once per course
    if (!studentId || !courseId || lessons.length === 0 || progressLoadedRef.current) return
    progressLoadedRef.current = true

    const loadProgressFromDatabase = async () => {
      try {
        // Try to fetch student progress from database
        const progressRes = await courseService.getStudentProgress(studentId, courseId)
        
        if (progressRes.success && progressRes.data) {
          const { completedLessons: dbCompletedLessons, currentLessonId: dbCurrentLessonId } = progressRes.data

          // Normalize DB ids to strings, dedupe, and only keep valid lesson ids
          if (dbCompletedLessons && Array.isArray(dbCompletedLessons) && dbCompletedLessons.length > 0) {
            const normalized = Array.from(new Set(dbCompletedLessons.map((id) => String(id))))
            setCompletedLessons(normalized)
          }

          if (dbCurrentLessonId && lessons.some(l => l.id === String(dbCurrentLessonId))) {
            setCurrentLessonId(String(dbCurrentLessonId))
          }
        } else {
          // No progress in database - clear localStorage cache to reflect clean state
          if (storageKey) {
            localStorage.removeItem(storageKey)
          }
          // Reset to initial state (first lesson)
          setCompletedLessons([])
          if (lessons.length > 0) {
            setCurrentLessonId(lessons[0].id)
          }
        }
      } catch (error) {
        console.error("Error loading progress from database:", error)
      }
    }

    loadProgressFromDatabase()
  }, [studentId, courseId, lessons.length, storageKey])

  /* -------------------- HANDLE RESUME LESSON FROM NAVIGATION STATE -------------------- */
  useEffect(() => {
    // If navigated from Continue Learning with resumeLessonId, auto-select that lesson
    const resumeLessonId = location.state?.resumeLessonId;
    if (resumeLessonId && lessons.length > 0) {
      const lessonExists = lessons.some(l => l.id === String(resumeLessonId));
      if (lessonExists) {
        setCurrentLessonId(String(resumeLessonId));
        // Clear the state to avoid re-triggering on future renders
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location.state, lessons, navigate, location.pathname]);

  /* -------------------- AUTO-SAVE PROGRESS (Local & Database) -------------------- */
  useEffect(() => {
    if (!storageKey) return

    const data = { currentLessonId, completedLessons }
    localStorage.setItem(storageKey, JSON.stringify(data))

    // Auto-save to database with debouncing. Use a ref to avoid overlapping saves
    const saveTimer = setTimeout(async () => {
      if (!studentId || !courseId) return
      if (inFlightSaveRef.current) return
      inFlightSaveRef.current = true
      try {
        const result = await courseService.updateStudentProgress(studentId, courseId, {
          completedLessons,
          currentLessonId,
        })

        // Merge backend result only when it differs from local optimistic state
        if (result && result.success && result.data) {
          const { completedLessons: dbCompletedLessons, currentLessonId: dbCurrentLessonId } = result.data
          if (Array.isArray(dbCompletedLessons)) {
            const localSet = new Set((completedLessons || []).map(String))
            const dbNormalized = Array.from(new Set(dbCompletedLessons.map(String)))
            // Only keep ids that exist in the current lessons list
            const dbValid = dbNormalized.filter((id) => lessons.some((l) => String(l.id) === id))
            const dbSet = new Set(dbValid)
            const equal = localSet.size === dbSet.size && [...localSet].every(x => dbSet.has(x))
            if (!equal) setCompletedLessons([...dbSet])
          }
          if (dbCurrentLessonId && String(dbCurrentLessonId) !== String(currentLessonId)) {
            setCurrentLessonId(String(dbCurrentLessonId))
          }
        }
      } catch (error) {
        console.error("Failed to auto-save progress to database:", error)
      } finally {
        inFlightSaveRef.current = false
      }
    }, 1000)

    return () => clearTimeout(saveTimer)
  }, [currentLessonId, completedLessons, studentId, courseId, storageKey])


  /* -------------------- HELPERS -------------------- */
  const currentLesson = lessons.find((l) => l.id === currentLessonId)
  // Count only unique, valid completed lesson ids (normalized)
  const completedSet = new Set((completedLessons || []).map(String))
  const uniqueCompletedCount = lessons.length
    ? lessons.filter((l) => completedSet.has(String(l.id))).length
    : 0
  const progress = lessons.length
    ? Math.min(100, Math.round((uniqueCompletedCount / lessons.length) * 100))
    : 0

  // Determine whether all lessons are completed
  const isAllLessonsCompleted = lessons.length > 0 && uniqueCompletedCount === lessons.length

  const handleLessonComplete = async () => {
    if (!currentLessonId || !courseId) return

    const prev = (completedLessons || []).map(String)
    const updated = Array.from(new Set([...prev, String(currentLessonId)]))
    // Optimistic update so UI responds immediately
    setCompletedLessons(updated)

    // Persist if we have a studentId; otherwise continue optimistic flow
    if (studentId) {
      try {
        const response = await courseService.updateStudentProgress(studentId, courseId, {
          completedLessons: updated,
          currentLessonId,
        })

        if (!response.success) {
          console.error("Failed to update progress:", response.error)
          setCompletedLessons(prev)
          return
        }
      } catch (error) {
        console.error("Error updating progress:", error)
        setCompletedLessons(prev)
        return
      }
    }

    // Navigate to next lesson or open quiz
    if (updated.length === lessons.length) {
      setTimeout(() => setIsQuizOpen(true), 500)
    } else {
      const currentIdx = lessons.findIndex((l) => l.id === currentLessonId)
      const next = lessons[currentIdx + 1]
      if (next) setCurrentLessonId(next.id)
    }
  }

  const handleRestartCourse = async () => {
    if (!studentId || !courseId || !lessons.length) return

    try {
      // Reset the database progress
      const firstLessonId = lessons[0]?.id || null
      const resetResult = await courseService.resetStudentProgress(studentId, courseId, firstLessonId)
      
      if (!resetResult.success) {
        console.error("Failed to reset progress in database:", resetResult.error)
      }
    } catch (error) {
      console.error("Failed to reset progress in database:", error)
    }

    // Clear all related localStorage keys
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
    // Also clear any quiz progress that might be cached
    localStorage.removeItem(`quiz-progress-${courseId}`)
    
    // Wait a moment then do a full page reload to reset everything
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }

  const handleEnrollCourse = async (courseId) => {
    if (!studentId) {
      alert("Please log in first")
      return
    }

    try {
      const enrolled = await courseService.enrollCourse(studentId, courseId)
      if (enrolled.success) {
        alert("Successfully enrolled! Loading course...")
        // Update local state without full reload
        setEnrolledCourseIds((prev) => Array.from(new Set([...(prev || []), courseId])))
        setIsEnrolled(true)
        // Optionally navigate to course page route (SPA navigation)
        navigate(`/student/coursePage/${courseId}`)
      } else {
        alert(enrolled.error || "Failed to enroll")
      }
    } catch (err) {
      console.error("Enrollment error:", err)
      alert("Error enrolling in course")
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
  // If a course is loaded but the student is not enrolled, show enroll CTA for this course
  if (course && !isEnrolled) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="max-w-4xl w-full p-6">
          <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
          <p className="text-sm text-gray-600">{course.description}</p>
          <div className="mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => handleEnrollCourse(course.id)}
            >
              Enroll to continue
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!course)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        <div className="max-w-4xl w-full p-6">
          <h2 className="text-2xl font-bold mb-4">Available Courses</h2>
          {courses.length === 0 ? (
            <p className="text-gray-500">No courses available.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {courses.map((c) => {
                const enrolledFlag = enrolledCourseIds.includes(c._id)
                return (
                  <div key={c._id} className="p-4 border-2 rounded-lg bg-white">
                    <h3 className="font-semibold">{c.title}</h3>
                    <p className="text-sm text-gray-600">{c.description}</p>
                    <p className="text-xs text-gray-500 mt-2">Difficulty: {c.difficulty}</p>
                    <div className="mt-3 flex gap-2">
                      {enrolledFlag ? (
                        <button
                          disabled
                          aria-disabled
                          className="px-3 py-1 bg-green-600 text-white rounded cursor-default opacity-75"
                        >
                          ✓ Enrolled
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                          onClick={() => handleEnrollCourse(c._id)}
                        >
                          Enroll
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-black-20 transition-colors">
      <AppHeader subtitle={course?.title || "Course"} />
      <StudentHeader
        courseTitle={course.title}
        progress={progress}
        onRestart={handleRestartCourse}
        userAvatar={user?.profileImage || user?.avatar}
        userName={user?.name}
        userId={user?._id}
      />

      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          <StudentSidebar
            lessons={lessons}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            onSelectLesson={setCurrentLessonId}
            progress={progress}
            finalQuiz={course?.finalQuiz}
            onOpenQuiz={async () => {
              // If quiz data already has questions, open immediately
              if (course?.finalQuiz && Array.isArray(course.finalQuiz.questions) && course.finalQuiz.questions.length > 0) {
                setIsQuizOpen(true)
                return
              }

              // Otherwise try to fetch quizzes for the course and populate questions
              try {
                const qRes = await courseService.getQuizzesByCourse(courseId)
                if (qRes.success && Array.isArray(qRes.data) && qRes.data.length > 0) {
                  const foundQuiz = qRes.data.find((q) => String(q._id) === String(course?.finalQuiz?._id) || String(q._id) === String(course?.finalQuiz?.id)) || qRes.data[0]
                  if (foundQuiz) {
                    const quizData = {
                      ...foundQuiz,
                      questions: (foundQuiz.questionIds || []).map((q) => ({
                        id: q._id || q.id,
                        type: q.type || 'mcq',
                        question: q.text || q.question || '',
                        options: Array.isArray(q.options) ? q.options : [],
                        correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
                        correctAnswer: q.correctAnswer || '',
                        points: q.points || 1,
                        explanation: q.explanation || '',
                      }))
                    }
                    setCourse((prev) => ({ ...prev, finalQuiz: quizData }))
                    setIsQuizOpen(true)
                    return
                  }
                }
              } catch (e) {
                console.error("Failed to fetch quiz on open:", e)
              }

              // Fallback: open modal anyway (it will render null if no questions)
              setIsQuizOpen(true)
            }}
            isAllLessonsCompleted={isAllLessonsCompleted}
            isAIPanelOpen={isAIPanelOpen}
            onToggleAIPanel={() => setIsAIPanelOpen(!isAIPanelOpen)}
          />

          <main className={`flex-1 space-y-6 transition-all duration-300 ${isAIPanelOpen ? "mr-96" : ""}`}>
            <LessonContent
              lesson={currentLesson}
              completed={completedSet.has(String(currentLessonId))}
              onCompleteLesson={handleLessonComplete}
            />
          </main>

          {/* AI Panel - Collapsible */}
          {isAIPanelOpen && (
            <aside className="w-96 sticky top-24 h-fit">
              <div className="bg-gradient-to-b from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-4">AI Assistant</h2>
                <div className="text-center text-gray-600 text-sm">
                  <p>AI features coming soon!</p>
                  <p className="mt-2 text-xs text-gray-500">This panel is reserved for future AI-powered learning assistance.</p>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      {/* Final Quiz Modal */}
      {isQuizOpen && course.finalQuiz && (
        <QuizModal quiz={course.finalQuiz} courseId={courseId} onClose={() => setIsQuizOpen(false)} />
      )}
    </div>
  )
}
