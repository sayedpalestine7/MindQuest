// /src/pages/TeacherCourseBuilder.jsx
import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import Header from "../components/courseBuilder/Header"
import Sidebar from "../components/courseBuilder/Sidebar"
import CourseInfo from "../components/courseBuilder/CourseInfo"
import LessonEditor from "../components/courseBuilder/LessonEditor"
import QuizSection from "../components/courseBuilder/QuizSection"
import PreviewModal from "../components/courseBuilder/PreviewModal"
import AIGenerateModal from "../components/courseBuilder/AIGenerateModal"
import courseService from "../services/courseService"
import { useAuth } from "../context/AuthContext"
import useCourseBuilder from "../hooks/useCourseBuilder"
import {
  validateCourse,
  sanitizeCourseForAPI,
  sanitizeLessonForAPI,
  sanitizeQuizForAPI,
} from "../utils/courseBuilderUtils"
import toast from "react-hot-toast"

export default function TeacherCourseBuilder() {
  const { id: courseId } = useParams()
  const { user, isAuthenticated, isLoading } = useAuth()
  const courseBuilder = useCourseBuilder(courseId)
  const [isAIGenerateOpen, setIsAIGenerateOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  
  /* ---------- EFFECTS ---------- */
  // Check auth and load course
  useEffect(() => {
    // Wait for auth to finish loading from localStorage
    if (isLoading) return

    // If not authenticated or not a teacher, show error
    if (!isAuthenticated || user?.role !== "teacher") {
      toast.error("Please login as a teacher to create courses")
      // Redirect would go here
      return
    }

    if (courseId) {
      courseBuilder.loadCourse(courseId)
    }
  }, [courseId, isLoading, isAuthenticated, user?.role])

  // Auto-save to localStorage after 2s (as backup)
  useEffect(() => {
    courseBuilder.setSaveStatus("unsaved")
    const timeoutId = setTimeout(() => {
      localStorage.setItem("course-backup", JSON.stringify({
        course: courseBuilder.course,
        lessons: courseBuilder.lessons,
      }))
      courseBuilder.setSaveStatus("saved")
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [courseBuilder.course, courseBuilder.lessons])

  /* ---------- SAVE / PREVIEW ---------- */
  const handleSave = async () => {
    courseBuilder.setErrors([])
    courseBuilder.setIsSaving(true)

    // Check auth
    if (!isAuthenticated || !user?._id) {
      courseBuilder.setErrors(["Please login to save courses"])
      courseBuilder.setIsSaving(false)
      toast.error("Please login to save courses")
      return
    }

    // Validate course data
    const courseValidation = validateCourse(courseBuilder.course)
    if (!courseValidation.isValid) {
      courseBuilder.setErrors(courseValidation.errors)
      courseBuilder.setIsSaving(false)
      courseValidation.errors.forEach((err) => toast.error(err))
      return
    }

    // Validate lessons exist
    if (courseBuilder.lessons.length === 0) {
      courseBuilder.setErrors(["Must have at least one lesson"])
      courseBuilder.setIsSaving(false)
      toast.error("Must have at least one lesson")
      return
    }

    try {
      // Sanitize course, lessons, and quiz data
      const courseData = sanitizeCourseForAPI(courseBuilder.course)
      const lessonsData = courseBuilder.lessons.map(sanitizeLessonForAPI)
      const quizData = courseBuilder.course.finalQuiz
        ? sanitizeQuizForAPI(courseBuilder.course.finalQuiz)
        : null

      // DEBUG: log payload being sent to backend (stringified for full view)
      try {
        console.log('Saving course payload (stringified):', JSON.stringify({
          courseData,
          lessonsData,
          quizData,
          courseId,
          userId: user?._id,
        }, null, 2))
      } catch (e) {
        console.log('Saving course payload (object):', { courseData, lessonsData, quizData, courseId, userId: user?._id })
      }

      let result

      if (courseId) {
        // Update existing course
        result = await courseService.updateCourse(courseId, {
          ...courseData,
          lessons: lessonsData,
          quiz: quizData,
        })
      } else {
        // Create new course
        result = await courseService.createCourse(
          {
            ...courseData,
            lessons: lessonsData,
            quiz: quizData,
          },
          user._id
        )
      }

      if (result.success) {
        toast.success(courseId ? "Course updated successfully!" : "Course created successfully!")
        courseBuilder.setSaveStatus("saved")
        // Optionally redirect after save
        // navigate(`/teacher/courseBuilder/${result.id}`)
      } else {
        courseBuilder.setErrors([result.error])
        toast.error(`Save failed: ${result.error}`)
      }
    } catch (error) {
      const errorMsg = error.message || "Failed to save course"
      courseBuilder.setErrors([errorMsg])
      toast.error(errorMsg)
      console.error("Save error:", error)
    } finally {
      courseBuilder.setIsSaving(false)
    }
  }

  const handleAIGenerateSubmit = async (payload) => {
    // payload: { topic, numQuestions, questionType }
    try {
      setIsGenerating(true)
      const result = await courseService.generateQuiz(courseId, payload)
      setIsGenerating(false)

      if (!result.success) {
        const err = result.error || "AI generation failed"
        courseBuilder.setErrors([err])
        toast.error(`Generation failed: ${err}`)
        return
      }

      // result.data may be envelope or raw questions
      const body = result.data || {}
      const questions = body.data?.questions || body.questions || []

      if (questions.length === 0) {
        toast.error("No questions returned from AI")
        return
      }

      // Insert into builder
      if (typeof courseBuilder.insertGeneratedQuestions === "function") {
        courseBuilder.insertGeneratedQuestions(questions)
      } else {
        toast.error("Builder cannot accept generated questions")
      }
    } catch (err) {
      setIsGenerating(false)
      const msg = err?.message || "Failed to generate questions"
      courseBuilder.setErrors([msg])
      toast.error(msg)
      console.error("AI generate error:", err)
    }
  }

  /* ---------- RENDER ---------- */
  // Show loading while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show error if not authenticated or not a teacher
  if (!isAuthenticated || user?.role !== "teacher") {
    return (
      <div className="min-h-screen bg-black-20 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            {!isAuthenticated
              ? "Please login to access the course builder."
              : "Only teachers can access the course builder. Please login with a teacher account."}
          </p>
          <a
            href="/login"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black-20">
      {/* Header */}
      <Header
        saveStatus={courseBuilder.isSaving ? "saving" : courseBuilder.saveStatus}
        onPreview={() => courseBuilder.setIsPreviewOpen(true)}
        onSave={handleSave}
        isSaving={courseBuilder.isSaving}
        isLoading={courseBuilder.isLoading}
      />

      {/* Error Messages */}
      {courseBuilder.errors.length > 0 && (
        <div className="container mx-auto px-6 py-4">
          <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
            <p className="font-semibold text-red-800 mb-2">Errors:</p>
            <ul className="text-red-700 text-sm space-y-1">
              {courseBuilder.errors.map((error, idx) => (
                <li key={idx}>• {error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Main Layout */}
      {!courseBuilder.isLoading ? (
        <div className="container mx-auto px-6 py-8 space-y-8">
          {/* Top: Course Info */}
          <CourseInfo
            course={courseBuilder.course}
            setCourse={courseBuilder.setCourse}
            handleImageUpload={courseBuilder.handleImageUpload}
          />

          {/* Middle: Lessons & Quiz (Left) + Lesson Editor (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Panel: Lessons + Quiz */}
            <div className="lg:col-span-1 space-y-6">
              {/* Lessons Panel */}
              <div className="bg-white rounded-xl shadow-lg p-6 border-2">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lessons ({courseBuilder.lessons.length})</h3>
                <Sidebar
                  lessons={courseBuilder.lessons}
                  selectedLessonId={courseBuilder.selectedLessonId}
                  setSelectedLessonId={courseBuilder.setSelectedLessonId}
                  addLesson={courseBuilder.addLesson}
                  deleteLesson={courseBuilder.deleteLesson}
                  updateLessonTitle={courseBuilder.updateLessonTitle}
                  handleDragStart={courseBuilder.handleDragStart}
                  handleDragOver={courseBuilder.handleDragOver}
                  handleDrop={courseBuilder.handleDrop}
                  handleDragEnd={courseBuilder.handleDragEnd}
                  draggedLessonId={courseBuilder.draggedLessonId}
                />
              </div>

              {/* Quiz Panel */}
              <QuizSection
                course={courseBuilder.course}
                setCourse={courseBuilder.setCourse}
                isQuizSectionOpen={courseBuilder.isQuizSectionOpen}
                setIsQuizSectionOpen={courseBuilder.setIsQuizSectionOpen}
                addQuizQuestion={courseBuilder.addQuizQuestion}
                updateQuizQuestion={courseBuilder.updateQuizQuestion}
                updateQuizOption={courseBuilder.updateQuizOption}
                deleteQuizQuestion={courseBuilder.deleteQuizQuestion}
                updateQuizSettings={courseBuilder.updateQuizSettings}
              />
              <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-semibold">💡 AI Quiz Generation</p>
                <p className="text-xs text-blue-600 mt-2">Use the "Generate from AI" button to auto-create quiz questions from your course content.</p>
                <div className="mt-3">
                  <button
                    onClick={() => setIsAIGenerateOpen(true)}
                    className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                    disabled={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate from AI'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Panel: Lesson Editor */}
            <div className="lg:col-span-3">
              <LessonEditor
                selectedLesson={courseBuilder.selectedLesson}
                draggedFieldId={courseBuilder.draggedFieldId}
                handleFieldDragStart={courseBuilder.handleFieldDragStart}
                handleFieldDragOver={courseBuilder.handleFieldDragOver}
                handleFieldDrop={courseBuilder.handleFieldDrop}
                handleFieldDragEnd={courseBuilder.handleFieldDragEnd}
                addField={courseBuilder.addField}
                deleteField={courseBuilder.deleteField}
                updateField={courseBuilder.updateField}
                handleHtmlFileUpload={courseBuilder.handleHtmlFileUpload}
                handleImageUpload={courseBuilder.handleImageUpload}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="container mx-auto px-6 py-8 text-center">
          <p className="text-gray-500">Loading course...</p>
        </div>
      )}

      {/* Preview Modal */}
      {courseBuilder.isPreviewOpen && (
        <PreviewModal
          course={courseBuilder.course}
          lessons={courseBuilder.lessons}
          onClose={() => courseBuilder.setIsPreviewOpen(false)}
        />
      )}
      <AIGenerateModal
        isOpen={isAIGenerateOpen}
        onClose={() => setIsAIGenerateOpen(false)}
        onSubmit={handleAIGenerateSubmit}
      />
    </div>
  )
}
