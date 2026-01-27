// /src/components/coursePage/StudentCoursePageWrapper.jsx
/**
 * StudentCoursePageWrapper - Reusable container for both actual student view and teacher preview
 * 
 * This wrapper enables the same UI to be used in:
 * 1. Real student context (with persistence to database)
 * 2. Teacher preview mode (ephemeral, no database writes)
 * 
 * Key architectural decisions:
 * - Single source of truth for layout/styling
 * - Mode prop controls behavior (student vs preview)
 * - Preview mode uses mocked data and blocks persistence
 * - No UI differences between modes (pixel-perfect)
 */
import React, { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router"
import StudentHeader from "./StudentHeader"
import AppHeader from "../shared/AppHeader"
import StudentSidebar from "./StudentSidebar"
import LessonContent from "./LessonContent"
import QuizModal from "./QuizModal"
import CourseReviewsSection from "./CourseReviewsSection"
import PaymentModal from "./PaymentModal"
import courseService from "../../services/courseService"
import paymentService from "../../services/paymentService"
import { useAuth } from "../../context/AuthContext"
import toast from "react-hot-toast"

export default function StudentCoursePageWrapper({
  // Mode control
  mode = "student", // 'student' | 'preview'
  
  // Preview-specific props (injected by teacher)
  previewCourse = null,
  previewLessons = null,
  previewQuiz = null,
  previewUser = null,
  onPreviewClose = null,
  hideHeader = false,
  
  // Student-specific props (from route params)
  courseIdProp = null,
  resumeLessonIdProp = null, // Lesson to auto-select when navigating from Continue Learning
}) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const progressLoadedRef = useRef(false)
  const inFlightSaveRef = useRef(false)
  
  const isPreviewMode = mode === "preview"
  
  /* -------------------- STATE -------------------- */
  const [course, setCourse] = useState(isPreviewMode ? previewCourse : null)
  const [lessons, setLessons] = useState(isPreviewMode ? previewLessons : [])
  
  // Payment state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentClientSecret, setPaymentClientSecret] = useState(null)
  const [paymentAmount, setPaymentAmount] = useState(0)
  const [paymentCourseTitle, setPaymentCourseTitle] = useState("")
  const [pendingEnrollCourseId, setPendingEnrollCourseId] = useState(null)
  const [currentLessonId, setCurrentLessonId] = useState(null)
  const [completedLessons, setCompletedLessons] = useState([])
  const [isQuizOpen, setIsQuizOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(!isPreviewMode)
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false)

  const getDefaultPreviewLessonId = (lessonList) => {
    if (!Array.isArray(lessonList) || lessonList.length === 0) return null
    const previewLesson = lessonList.find((lesson) => lesson.isPreview)
    return previewLesson ? previewLesson.id : lessonList[0].id
  }
  
  // Student ID - in preview mode, use mock ID
  const [studentId, setStudentId] = useState(() => {
    if (isPreviewMode) return "preview-mock-student-id"
    
    try {
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsed = JSON.parse(storedUser)
        return parsed?._id || parsed?.id || localStorage.getItem("userId") || null
      }
    } catch (e) {
      // Ignore parse errors
    }
    return localStorage.getItem("userId") || null
  })
  
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([])
  const [isEnrolled, setIsEnrolled] = useState(isPreviewMode ? true : false)
  
  // Effective courseId
  const courseId = isPreviewMode ? previewCourse?.id : courseIdProp
  
  /* -------------------- STORAGE KEY (namespaced per student+course) -------------------- */
  const storageKey = React.useMemo(() => {
    if (isPreviewMode) return null // No persistence in preview
    return studentId && courseId ? `student-progress:${studentId}:${courseId}` : null
  }, [studentId, courseId, isPreviewMode])
  
  /* -------------------- LOAD COURSE DATA (Student mode only) -------------------- */
  useEffect(() => {
    if (isPreviewMode) {
      // Preview mode: data is already injected via props
      // Ensure lessons state is synced with previewLessons prop
      if (previewLessons && previewLessons.length > 0) {
        setLessons(previewLessons)
        if (!currentLessonId) {
          const defaultLessonId = getDefaultPreviewLessonId(previewLessons)
          if (defaultLessonId) setCurrentLessonId(defaultLessonId)
        }
      }
      setLoading(false)
      return
    }
    
    // Student mode: load from backend
    const loadCourseData = async () => {
      setLoading(true)
      
      if (courseId) {
        const res = await courseService.getCourseById(courseId)
        if (res.success) {
          const full = res.data
          const lessonsData = (full.lessonIds || []).map((l) => ({
            id: String(l._id),
            title: l.title,
            isPreview: l.isPreview || false,
            fields: (l.fieldIds || []).map((f) => {
              let content = f.content
              if (f.type === "table" && (!content || typeof content !== "object" || !content.data)) {
                content = {
                  rows: 3,
                  columns: 3,
                  data: Array(3).fill(null).map(() => Array(3).fill(""))
                }
              }
              
              return {
                id: String(f._id || f.id),
                type: f.type,
                content: content,
                animationId: f.animationId || null,
                animationPreviewMode: f.animationPreviewMode || "start-stop",
                correctAnswer: f.correctAnswer ?? f.answer ?? "",
                explanation: f.explanation ?? "",
              }
            }),
          }))
          
          let quizData = null
          if (full.quizId) {
            if (typeof full.quizId === "string") {
              try {
                const qRes = await courseService.getQuizzesByCourse(full._id)
                if (qRes.success && Array.isArray(qRes.data)) {
                  const foundQuiz = qRes.data.find((q) => q._id === full.quizId || q.id === full.quizId) || qRes.data[0] || null
                  if (foundQuiz) {
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
          
          if (!storageKey && lessonsData.length > 0) {
            setCurrentLessonId(lessonsData[0].id)
          }
          
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
          
          if (storageKey) {
            const progress = localStorage.getItem(storageKey)
            if (progress) {
              const { completedLessons: c, currentLessonId: cId } = JSON.parse(progress)
              if (Array.isArray(c) && c.length > 0) {
                const normalized = Array.from(new Set(c.map((id) => String(id))))
                const valid = normalized.filter((id) => lessonsData.some((l) => String(l.id) === id))
                setCompletedLessons(valid)
              }
              if (cId && lessonsData.some(l => l.id === String(cId))) setCurrentLessonId(String(cId))
            }
          }
        } else {
          console.error("Failed to load course:", res.error)
        }
      } else {
        const res = await courseService.getAllCourses()
        if (res.success) {
          setCourses(res.data || [])
        } else {
          console.error("Failed to load courses:", res.error)
        }
        
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
  }, [courseId, studentId, isPreviewMode])
  
  /* -------------------- LOAD PROGRESS FROM DATABASE (Student mode only) -------------------- */
  useEffect(() => {
    if (isPreviewMode) return
    if (!studentId || !courseId || lessons.length === 0 || progressLoadedRef.current) return
    progressLoadedRef.current = true
    
    const loadProgressFromDatabase = async () => {
      try {
        const progressRes = await courseService.getStudentProgress(studentId, courseId)
        
        if (progressRes.success && progressRes.data) {
          const { completedLessons: dbCompletedLessons, currentLessonId: dbCurrentLessonId } = progressRes.data
          
          if (dbCompletedLessons && Array.isArray(dbCompletedLessons) && dbCompletedLessons.length > 0) {
            const normalized = Array.from(new Set(dbCompletedLessons.map((id) => String(id))))
            setCompletedLessons(normalized)
          }
          
          if (dbCurrentLessonId && lessons.some(l => l.id === String(dbCurrentLessonId))) {
            setCurrentLessonId(String(dbCurrentLessonId))
          }
        } else {
          if (storageKey) {
            localStorage.removeItem(storageKey)
          }
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
  }, [studentId, courseId, lessons.length, storageKey, isPreviewMode])
  
  /* -------------------- HANDLE RESUME LESSON FROM NAVIGATION STATE -------------------- */
  useEffect(() => {
    // If navigated from Continue Learning with resumeLessonId, auto-select that lesson
    if (isPreviewMode) return
    if (resumeLessonIdProp && lessons.length > 0) {
      const lessonExists = lessons.some(l => l.id === String(resumeLessonIdProp))
      if (lessonExists) {
        setCurrentLessonId(String(resumeLessonIdProp))
      }
    }
  }, [resumeLessonIdProp, lessons, isPreviewMode])
  
  /* -------------------- AUTO-SAVE PROGRESS (Student mode only) -------------------- */
  useEffect(() => {
    if (isPreviewMode) return // No persistence in preview mode
    if (!storageKey) return
    
    const data = { currentLessonId, completedLessons }
    localStorage.setItem(storageKey, JSON.stringify(data))
    
    const saveTimer = setTimeout(async () => {
      if (!studentId || !courseId) return
      if (inFlightSaveRef.current) return
      inFlightSaveRef.current = true
      try {
        const result = await courseService.updateStudentProgress(studentId, courseId, {
          completedLessons,
          currentLessonId,
        })
        
        if (result && result.success && result.data) {
          const { completedLessons: dbCompletedLessons, currentLessonId: dbCurrentLessonId } = result.data
          if (Array.isArray(dbCompletedLessons)) {
            const localSet = new Set((completedLessons || []).map(String))
            const dbNormalized = Array.from(new Set(dbCompletedLessons.map(String)))
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
  }, [currentLessonId, completedLessons, studentId, courseId, storageKey, isPreviewMode])
  
  /* -------------------- HELPERS -------------------- */
  const currentLesson = lessons.find((l) => l.id === currentLessonId)
  const completedSet = new Set((completedLessons || []).map(String))
  const uniqueCompletedCount = lessons.length
    ? lessons.filter((l) => completedSet.has(String(l.id))).length
    : 0
  const progress = lessons.length
    ? Math.min(100, Math.round((uniqueCompletedCount / lessons.length) * 100))
    : 0
  
  const isAllLessonsCompleted = isPreviewMode ? true : (lessons.length > 0 && uniqueCompletedCount === lessons.length)
  
  const handleLessonComplete = async () => {
    if (!currentLessonId || !courseId) return
    
    const prev = (completedLessons || []).map(String)
    const updated = Array.from(new Set([...prev, String(currentLessonId)]))
    setCompletedLessons(updated)
    
    // In preview mode, skip database persistence
    if (!isPreviewMode && studentId) {
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
    
    if (updated.length === lessons.length) {
      setTimeout(() => setIsQuizOpen(true), 500)
    } else {
      const currentIdx = lessons.findIndex((l) => l.id === currentLessonId)
      const next = lessons[currentIdx + 1]
      if (next) setCurrentLessonId(next.id)
    }
  }
  
  const handleRestartCourse = async () => {
    if (isPreviewMode) {
      // In preview mode, just reset local state
      setCompletedLessons([])
      if (lessons.length > 0) {
        const defaultLessonId = getDefaultPreviewLessonId(lessons)
        if (defaultLessonId) setCurrentLessonId(defaultLessonId)
      }
      return
    }
    
    // Student mode: reset database and localStorage
    if (!studentId || !courseId || !lessons.length) return
    
    try {
      const firstLessonId = lessons[0]?.id || null
      const resetResult = await courseService.resetStudentProgress(studentId, courseId, firstLessonId)
      
      if (!resetResult.success) {
        console.error("Failed to reset progress in database:", resetResult.error)
      }
    } catch (error) {
      console.error("Failed to reset progress in database:", error)
    }
    
    if (storageKey) {
      localStorage.removeItem(storageKey)
    }
    localStorage.removeItem(`quiz-progress-${courseId}`)
    
    setTimeout(() => {
      window.location.reload()
    }, 300)
  }
  
  const handleEnrollCourse = async (courseId) => {
    if (isPreviewMode) return // No enrollment in preview
    
    if (!studentId) {
      toast.error("Please log in first")
      return
    }
    
    try {
      // Fetch course to check if it's paid
      const courseRes = await courseService.getCourseById(courseId)
      if (!courseRes.success) {
        toast.error("Failed to load course details")
        return
      }
      
      const courseData = courseRes.data
      const price = Number(courseData.price) || 0
      
      // If course is free, enroll immediately
      if (price === 0) {
        const enrolled = await courseService.enrollCourse(studentId, courseId)
        if (enrolled.success) {
          toast.success("Successfully enrolled! Loading course...")
          setEnrolledCourseIds((prev) => Array.from(new Set([...(prev || []), courseId])))
          setIsEnrolled(true)
          navigate(`/student/coursePage/${courseId}`)
        } else {
          toast.error(enrolled.error || "Failed to enroll")
        }
        return
      }
      
      // Course is paid - create payment intent
      toast.loading("Preparing payment...", { id: "payment-loading" })
      const paymentRes = await paymentService.createPaymentIntent(courseId, studentId)
      toast.dismiss("payment-loading")
      
      if (!paymentRes.success) {
        toast.error(paymentRes.error || "Failed to initialize payment")
        return
      }
      
      // Open payment modal
      setPendingEnrollCourseId(courseId)
      setPaymentClientSecret(paymentRes.clientSecret)
      setPaymentAmount(paymentRes.amount)
      setPaymentCourseTitle(paymentRes.courseTitle || courseData.title)
      setIsPaymentModalOpen(true)
      
    } catch (err) {
      console.error("Enrollment error:", err)
      toast.error("Error processing enrollment")
    }
  }
  
  const handlePaymentSuccess = async (paymentIntent) => {
    console.log("✅ Payment successful:", paymentIntent.id)
    toast.success("Payment successful! Enrolling...")
    
    // Close payment modal
    setIsPaymentModalOpen(false)
    
    try {
      // Enroll after successful payment
      const enrolled = await courseService.enrollCourse(studentId, pendingEnrollCourseId)
      if (enrolled.success) {
        toast.success("Successfully enrolled! Loading course...")
        setEnrolledCourseIds((prev) => Array.from(new Set([...(prev || []), pendingEnrollCourseId])))
        setIsEnrolled(true)
        navigate(`/student/coursePage/${pendingEnrollCourseId}`)
      } else {
        toast.error(enrolled.error || "Enrollment failed after payment")
      }
    } catch (err) {
      console.error("Enrollment error after payment:", err)
      toast.error("Payment succeeded but enrollment failed. Please contact support.")
    } finally {
      // Clean up payment state
      setPendingEnrollCourseId(null)
      setPaymentClientSecret(null)
      setPaymentAmount(0)
      setPaymentCourseTitle("")
    }
  }
  
  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false)
    setPendingEnrollCourseId(null)
    setPaymentClientSecret(null)
    setPaymentAmount(0)
    setPaymentCourseTitle("")
    toast.info("Payment cancelled")
  }
  
  /* -------------------- RENDER -------------------- */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    )
  }
  
  // Enrollment checks only apply in student mode
  if (!isPreviewMode) {
    if (course && !isEnrolled) {
      // Find preview lessons
      const previewLessons = lessons.filter(l => l.isPreview)
      
      // If there are preview lessons, allow access to them
      if (previewLessons.length > 0) {
        // Redirect to first preview lesson if current lesson is not a preview
        if (!currentLessonId || !previewLessons.find(l => l.id === currentLessonId)) {
          if (currentLessonId !== previewLessons[0].id) {
            setCurrentLessonId(previewLessons[0].id)
          }
        }
        // Continue to render with limited access (handled in StudentSidebar and LessonContent)
      } else {
        // No preview lessons available - show enrollment gate
        return (
          <div className="min-h-screen flex items-center justify-center text-gray-600">
            <div className="max-w-4xl w-full p-6">
              <h2 className="text-2xl font-bold mb-4">{course.title}</h2>
              <p className="text-sm text-gray-600 mb-4">{course.description}</p>
              
              {/* Price Badge */}
              <div className="mb-4">
                {course.price > 0 ? (
                  <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 font-bold text-lg rounded-lg">
                    ${course.price}
                  </span>
                ) : (
                  <span className="inline-block px-4 py-2 bg-green-100 text-green-700 font-bold text-lg rounded-lg">
                    Free
                  </span>
                )}
              </div>
              
              <p className="text-gray-500 mb-4">This course requires enrollment to access.</p>
              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                onClick={() => handleEnrollCourse(course.id)}
              >
                Enroll Now
              </button>
            </div>
          </div>
        )
      }
    }
    
    if (!course) {
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
    }
  }
  
  // Get effective user for header
  const effectiveUser = isPreviewMode ? previewUser : user
  
  // In preview mode, treat as enrolled for UI purposes
  const effectiveEnrollment = isPreviewMode ? true : isEnrolled
  
  return (
    <div className="min-h-screen bg-black-20 transition-colors">
      {!hideHeader && (
        <>
          <AppHeader subtitle={course?.title || "Course"} />
          {/* {!isPreviewMode && (
            <StudentHeader
              courseTitle={course?.title}
              progress={progress}
              onRestart={handleRestartCourse}
              userAvatar={effectiveUser?.profileImage || effectiveUser?.avatar}
              userName={effectiveUser?.name}
              userId={effectiveUser?._id}
            />
          )} */}
        </>
      )}
      
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          <StudentSidebar
            lessons={lessons}
            currentLessonId={currentLessonId}
            completedLessons={completedLessons}
            onSelectLesson={setCurrentLessonId}
            progress={progress}
            isEnrolled={effectiveEnrollment}
            isPreviewMode={isPreviewMode}
            finalQuiz={course?.finalQuiz || previewQuiz}
            onOpenQuiz={async () => {
              if (course?.finalQuiz && Array.isArray(course.finalQuiz.questions) && course.finalQuiz.questions.length > 0) {
                setIsQuizOpen(true)
                return
              }
              
              // Preview mode: use previewQuiz directly
              if (isPreviewMode && previewQuiz) {
                setCourse((prev) => ({ ...prev, finalQuiz: previewQuiz }))
                setIsQuizOpen(true)
                return
              }
              
              // Student mode: fetch from backend
              if (!isPreviewMode) {
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
              }
              
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
              isEnrolled={effectiveEnrollment}
              isPreviewMode={isPreviewMode}
              onEnroll={() => handleEnrollCourse(course?.id)}
            />
            
            {/* Course Reviews Section - Only shown when NOT enrolled */}
            {!isPreviewMode && (
              <CourseReviewsSection 
                courseId={courseId} 
                isEnrolled={isEnrolled}
              />
            )}
          </main>
          
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
      
      {isQuizOpen && (course?.finalQuiz || previewQuiz) && (
        <QuizModal 
          quiz={course?.finalQuiz || previewQuiz} 
          courseId={courseId} 
          onClose={() => setIsQuizOpen(false)}
          previewMode={isPreviewMode}
        />
      )}
      
      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentCancel}
        clientSecret={paymentClientSecret}
        amount={paymentAmount}
        courseTitle={paymentCourseTitle}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
