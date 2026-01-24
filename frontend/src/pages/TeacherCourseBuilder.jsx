// /src/pages/TeacherCourseBuilder.jsx
import React, { useEffect, useState } from "react"
import { useParams } from "react-router"
import AppHeader from "../components/shared/AppHeader"
import Breadcrumb from "../components/courseBuilder/Breadcrumb"
import WorkflowProgress from "../components/courseBuilder/WorkflowProgress"
import LeftPanel from "../components/courseBuilder/LeftPanel"
import CourseInfo from "../components/courseBuilder/CourseInfo"
import LessonEditor from "../components/courseBuilder/LessonEditor"
import QuizEditor from "../components/courseBuilder/QuizEditor"
import PreviewModalRefactored from "../components/courseBuilder/PreviewModalRefactored"
import AIGenerateModal from "../components/courseBuilder/AIGenerateModal"
import AIHtmlGenerateModal from "../components/courseBuilder/AIHtmlGenerateModal"
import HtmlPreviewModal from "../components/courseBuilder/HtmlPreviewModal"
import { ProgressBar } from "../components/courseBuilder/ProgressBar"
import { ErrorBanner } from "../components/courseBuilder/ErrorBanner"
import courseService from "../services/courseService"
import { useAuth } from "../context/AuthContext"
import useCourseBuilder from "../hooks/useCourseBuilder"
import {
  validateCourse,
  validateQuiz,
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
  const [isAIHtmlGenerateOpen, setIsAIHtmlGenerateOpen] = useState(false)
  const [isHtmlPreviewOpen, setIsHtmlPreviewOpen] = useState(false)
  const [generatedHtml, setGeneratedHtml] = useState({ content: "", filename: "", topic: "" })
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeEditorTab, setActiveEditorTab] = useState("lessons")
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem("courseBuilder-sidebar-collapsed")
    return saved === "true"
  })
  const [saveProgress, setSaveProgress] = useState({ status: "idle", message: "", progress: 0 })

  /* ---------- EFFECTS ---------- */
  // Persist sidebar collapsed state
  useEffect(() => {
    localStorage.setItem("courseBuilder-sidebar-collapsed", String(isSidebarCollapsed))
  }, [isSidebarCollapsed])

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

  // Auto-save to database after 3s
  useEffect(() => {
    if (!courseId || !isAuthenticated || !user?._id) return

    courseBuilder.setSaveStatus("unsaved")
    const timeoutId = setTimeout(async () => {
      try {
        // Validate course data before auto-save
        const courseValidation = validateCourse(courseBuilder.course)
        if (!courseValidation.isValid) {
          // Skip auto-save if validation fails, keep it as unsaved
          return
        }

        // Validate lessons exist
        if (courseBuilder.lessons.length === 0) {
          return
        }

        // Prepare data for auto-save
        const courseData = sanitizeCourseForAPI(courseBuilder.course)
        const lessonsData = courseBuilder.lessons.map(sanitizeLessonForAPI)
        const quizData = courseBuilder.course.finalQuiz
          ? sanitizeQuizForAPI(courseBuilder.course.finalQuiz)
          : null

        // Auto-save to database
        const result = await courseService.updateCourse(courseId, {
          ...courseData,
          lessons: lessonsData,
          quiz: quizData,
        })

        if (result.success) {
          courseBuilder.setSaveStatus("saved")
          console.log("Auto-save successful")
        }
      } catch (error) {
        console.error("Auto-save error:", error)
        // Don't show error to user for auto-save failures
      }
    }, 10000)

    return () => clearTimeout(timeoutId)
  }, [courseBuilder.course, courseBuilder.lessons, courseId, isAuthenticated, user?._id])

  // Warn user if they try to leave with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (courseBuilder.saveStatus === "unsaved") {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [courseBuilder.saveStatus])

  /* ---------- SAVE / PREVIEW ---------- */
  const handleSave = async () => {
    courseBuilder.setErrors([])
    courseBuilder.setIsSaving(true)
    setSaveProgress({ status: "loading", message: "Validating course...", progress: 20 })

    // Check auth
    if (!isAuthenticated || !user?._id) {
      courseBuilder.setErrors(["Please login to save courses"])
      courseBuilder.setIsSaving(false)
      setSaveProgress({ status: "error", message: "Authentication failed", error: "Please login first" })
      toast.error("Please login to save courses")
      return
    }

    // Validate course data
    const courseValidation = validateCourse(courseBuilder.course)
    if (!courseValidation.isValid) {
      courseBuilder.setErrors(courseValidation.errors)
      courseBuilder.setIsSaving(false)
      setSaveProgress({ status: "error", message: "Validation failed", error: courseValidation.errors[0] })
      courseValidation.errors.forEach((err) => toast.error(err))
      return
    }
    // Validate lessons exist
    if (courseBuilder.lessons.length === 0) {
      courseBuilder.setErrors(["Must have at least one lesson"])
      courseBuilder.setIsSaving(false)
      setSaveProgress({ status: "error", message: "Validation failed", error: "Add at least one lesson" })
      toast.error("Must have at least one lesson")
      return
    }

    // Validate quiz if it has questions
    if (courseBuilder.course.finalQuiz?.questions?.length > 0) {
      const quizValidation = validateQuiz(courseBuilder.course.finalQuiz)
      if (!quizValidation.isValid) {
        courseBuilder.setErrors(quizValidation.errors)
        courseBuilder.setIsSaving(false)
        setSaveProgress({ status: "error", message: "Quiz validation failed", error: quizValidation.errors[0] })
        quizValidation.errors.forEach((err) => toast.error(err))
        return
      }
    }

    try {
      setSaveProgress({ status: "loading", message: "Preparing data...", progress: 40 })

      // Sanitize course, lessons, and quiz data
      const courseData = sanitizeCourseForAPI(courseBuilder.course)
      const lessonsData = courseBuilder.lessons.map(sanitizeLessonForAPI)
      const quizData = courseBuilder.course.finalQuiz
        ? sanitizeQuizForAPI(courseBuilder.course.finalQuiz)
        : null

      setSaveProgress({ status: "loading", message: "Saving to server...", progress: 60 })

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
        setSaveProgress({ status: "success", message: courseId ? "Course updated!" : "Course created!", progress: 100 })
        toast.success(courseId ? "Course updated successfully!" : "Course created successfully!")
        courseBuilder.setSaveStatus("saved")
        // Auto-dismiss success after 2s
        setTimeout(() => setSaveProgress({ status: "idle" }), 2000)
        // Optionally redirect after save
        // navigate(`/teacher/courseBuilder/${result.id}`)
      } else {
        setSaveProgress({ status: "error", message: "Save failed", error: result.error })
        courseBuilder.setErrors([result.error])
        toast.error(`Save failed: ${result.error}`)
      }
    } catch (error) {
      const errorMsg = error.message || "Failed to save course"
      setSaveProgress({ status: "error", message: "Error saving", error: errorMsg })
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

      const n8nUrl = "http://localhost:5678/webhook/MindQuest"
      // Normalize requested types to canonical tokens before sending to n8n
      const normalizeType = (t) => {
        const s = String(t || "").toLowerCase().trim()
        if (["t/f", "tf", "true_false", "truefalse", "true-false"].includes(s)) return "tf"
        if (["short", "short_answer", "short-answer", "shortanswer"].includes(s)) return "short"
        if (["mcq", "multiple", "multiple_choice", "multiple-choice", "multiplechoice"].includes(s)) return "mcq"
        return s || 'mcq'
      }

      const allowedTypes = Array.isArray(payload?.questionTypes)
        ? [...new Set(payload.questionTypes.map(normalizeType))]
        : []

      const n8nPayload = {
        topic: payload?.topic,
        num: payload?.numQuestions,
        types: allowedTypes,
      }

      try {
        console.debug("n8n generate: POST", n8nUrl, n8nPayload)
      } catch (e) { }

      const resp = await fetch(n8nUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(n8nPayload),
      })

      let body = null
      try {
        body = await resp.json()
      } catch (e) {
        body = null
      }

      setIsGenerating(false)

      if (!resp.ok) {
        const err = body?.message || body?.error || "n8n generation failed"
        courseBuilder.setErrors([err])
        toast.error(`Generation failed: ${err}`)
        return
      }

      // n8n may return: {questions:[...]}, {data:{questions:[...]}}, or [...]
      const questions =
        body?.data?.questions ||
        body?.data?.output ||
        body?.questions ||
        body?.output ||
        (Array.isArray(body) ? body : [])

      if (!Array.isArray(questions) || questions.length === 0) {
        toast.error("No questions returned from n8n")
        return
      }

      // Client-side enforcement (n8n/LLM may ignore requested num/types)
      const requestedCount = Number(payload?.numQuestions)

      const filtered = allowedTypes.length > 0
        ? questions.filter((q) => allowedTypes.includes(normalizeType(q?.type)))
        : questions

      const finalQuestions = Number.isInteger(requestedCount) && requestedCount > 0
        ? filtered.slice(0, requestedCount)
        : filtered

      try {
        const typesReceived = questions.map((q) => normalizeType(q?.type))
        const typesFiltered = filtered.map((q) => normalizeType(q?.type))
        const typesFinal = finalQuestions.map((q) => normalizeType(q?.type))
        console.debug("n8n generate: requestedCount=", requestedCount, "allowedTypes=", allowedTypes)
        console.debug("n8n generate: received=", questions.length, "types=", typesReceived)
        console.debug("n8n generate: filtered=", filtered.length, "types=", typesFiltered)
        console.debug("n8n generate: final=", finalQuestions.length, "types=", typesFinal)
      } catch (e) { }

      if (finalQuestions.length === 0) {
        toast.error("n8n returned questions, but none matched the selected type(s)")
        return
      }

      if (Number.isInteger(requestedCount) && finalQuestions.length < requestedCount) {
        toast.error(`n8n returned only ${finalQuestions.length} question(s) matching your selected type(s)`)
      }

      // If user requested persistence and we have a courseId, send to backend import endpoint
      if (payload?.persist && courseId) {
        try {
          const importBody = { questions: finalQuestions, createQuiz: true, quizTitle: `Generated: ${payload.topic}` };
          const imp = await courseService.importQuestions(courseId, importBody);
          if (imp.success) {
            // Refresh course to pick up persisted quiz/questions
            await courseBuilder.loadCourse(courseId);
            toast.success('Generated questions persisted to course quiz');
          } else {
            toast.error(`Persist failed: ${imp.error}`);
            // Fallback: still insert locally
            if (typeof courseBuilder.insertGeneratedQuestions === 'function') courseBuilder.insertGeneratedQuestions(finalQuestions);
          }
        } catch (e) {
          toast.error('Failed to persist generated questions');
          if (typeof courseBuilder.insertGeneratedQuestions === 'function') courseBuilder.insertGeneratedQuestions(finalQuestions);
        }
      } else {
        // Insert into builder — prefer inserting (prepend) new questions instead of replacing
        if (typeof courseBuilder.insertGeneratedQuestions === "function") {
          courseBuilder.insertGeneratedQuestions(finalQuestions)
        } else if (typeof courseBuilder.replaceGeneratedQuestions === "function") {
          courseBuilder.replaceGeneratedQuestions(finalQuestions)
        } else {
          toast.error("Builder cannot accept generated questions")
        }
      }
    } catch (err) {
      setIsGenerating(false)
      const msg = err?.message || "Failed to generate questions"
      courseBuilder.setErrors([msg])
      toast.error(msg)
      console.error("n8n generate error:", err)
    }
  }

  const handleAIHtmlGenerateSubmit = async (payload) => {
    // payload: { topic }
    try {
      setIsGenerating(true)

      const n8nUrl = "http://localhost:5678/webhook/generate-html"
      const n8nPayload = {
        topic: payload?.topic || "",
      }

      console.log("n8n HTML generate: POST", n8nUrl, n8nPayload)

      let resp
      try {
        resp = await fetch(n8nUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(n8nPayload),
        })
      } catch (fetchError) {
        setIsGenerating(false)
        const errorMsg = "Cannot connect to n8n. Make sure n8n is running at " + n8nUrl
        console.error("n8n fetch error:", fetchError)
        courseBuilder.setErrors([errorMsg])
        toast.error(errorMsg)
        return
      }

      setIsGenerating(false)

      if (!resp.ok) {
        let errorMsg = `n8n returned error status ${resp.status}`
        try {
          const body = await resp.json()
          errorMsg = body?.message || body?.error || errorMsg
        } catch (e) { 
          try {
            const text = await resp.text()
            errorMsg = text || errorMsg
          } catch (e2) { }
        }
        console.error("n8n error response:", errorMsg)
        courseBuilder.setErrors([errorMsg])
        toast.error(`Generation failed: ${errorMsg}`)
        return
      }

      // n8n returns HTML as text
      let htmlContent
      try {
        htmlContent = await resp.text()
      } catch (e) {
        toast.error("Failed to read response from n8n")
        console.error("Failed to read n8n response:", e)
        return
      }

      console.log("Received HTML length:", htmlContent?.length)

      if (!htmlContent || htmlContent.trim().length === 0) {
        toast.error("No HTML returned from n8n")
        return
      }

      // Store generated HTML and show preview modal
      const filename = `${payload.topic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.html`
      setGeneratedHtml({
        content: htmlContent,
        filename: filename,
        topic: payload.topic
      })
      setIsHtmlPreviewOpen(true)
      
      toast.success(`✅ HTML generated! Preview and download below.`)
    } catch (err) {
      setIsGenerating(false)
      const msg = err?.message || "Failed to generate HTML"
      courseBuilder.setErrors([msg])
      toast.error(msg)
      console.error("n8n HTML generate error:", err)
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
      <AppHeader
        subtitle="Course Builder"
        courseBuilderControls={{
          saveStatus: courseBuilder.isSaving ? "saving" : courseBuilder.saveStatus,
          onPreview: () => courseBuilder.setIsPreviewOpen(true),
          onSave: handleSave,
          isSidebarCollapsed,
          onToggleSidebar: () => setIsSidebarCollapsed(!isSidebarCollapsed),
        }}
      />
      {/* Main Layout */}
      {!courseBuilder.isLoading ? (
        <div className="container mx-auto px-6 py-8 space-y-6">
          {/* Workflow Progress */}
          {/* <WorkflowProgress course={courseBuilder.course} lessons={courseBuilder.lessons} /> */}

          {/* Breadcrumb Navigation */}
          <Breadcrumb
            courseTitle={courseBuilder.course.title}
            lessonTitle={courseBuilder.selectedLesson?.title}
            activeTab={activeEditorTab}
          />

          {/* Error Banner */}
          <ErrorBanner
            errors={courseBuilder.errors}
            onDismiss={() => courseBuilder.setErrors([])}
            type="error"
            dismissible
          />

          {/* Course Info - Collapsible */}
          <CourseInfo
            course={courseBuilder.course}
            setCourse={courseBuilder.setCourse}
            handleImageUpload={courseBuilder.handleImageUpload}
          />

          {/* Main Content: Left Panel (Tabbed) + Lesson Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 min-h-[600px]">
            {/* Left Panel: Tabbed Interface - Conditionally Visible */}
            {!isSidebarCollapsed && (
              <div className="lg:col-span-2">
                <LeftPanel
                  // Lessons props
                  lessons={courseBuilder.lessons}
                  selectedLessonId={courseBuilder.selectedLessonId}
                  setSelectedLessonId={courseBuilder.setSelectedLessonId}
                  addLesson={courseBuilder.addLesson}
                  deleteLesson={courseBuilder.deleteLesson}
                updateLessonTitle={courseBuilder.updateLessonTitle}
                updateLessonPreview={courseBuilder.updateLessonPreview}
                handleDragStart={courseBuilder.handleDragStart}
                handleDragOver={courseBuilder.handleDragOver}
                handleDrop={courseBuilder.handleDrop}
                handleDragEnd={courseBuilder.handleDragEnd}
                draggedLessonId={courseBuilder.draggedLessonId}
                // Quiz props
                course={courseBuilder.course}
                setCourse={courseBuilder.setCourse}
                isQuizSectionOpen={courseBuilder.isQuizSectionOpen}
                setIsQuizSectionOpen={courseBuilder.setIsQuizSectionOpen}
                addQuizQuestion={courseBuilder.addQuizQuestion}
                updateQuizQuestion={courseBuilder.updateQuizQuestion}
                updateQuizOption={courseBuilder.updateQuizOption}
                deleteQuizQuestion={courseBuilder.deleteQuizQuestion}
                updateQuizSettings={courseBuilder.updateQuizSettings}
                // AI Tools props
                onOpenAIGenerate={() => {
                  setIsAIGenerateOpen(true)
                  setActiveEditorTab("quiz")
                }}
                onOpenAIHtmlGenerate={() => {
                  setIsAIHtmlGenerateOpen(true)
                }}
                isGenerating={isGenerating}
                // Tab control
                activeTab={activeEditorTab}
                onTabChange={setActiveEditorTab}
              />
              </div>
            )}

            {/* Right Panel: Conditional Editor - Expands when sidebar collapsed */}
            <div className={isSidebarCollapsed ? "lg:col-span-7" : "lg:col-span-5"}>
              {activeEditorTab === "quiz" ? (
                <QuizEditor
                  course={courseBuilder.course}
                  addQuizQuestion={courseBuilder.addQuizQuestion}
                  updateQuizQuestion={courseBuilder.updateQuizQuestion}
                  updateQuizOption={courseBuilder.updateQuizOption}
                  deleteQuizQuestion={courseBuilder.deleteQuizQuestion}
                  updateQuizSettings={courseBuilder.updateQuizSettings}
                  onNavigateToLessons={() => setActiveEditorTab("lessons")}
                />
              ) : (
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
                  onNavigateToQuiz={() => {
                    setActiveEditorTab("quiz")
                    // Also switch the LeftPanel tab for consistency
                    // LeftPanel uses activeEditorTab via props so this is enough
                  }}
                />
              )}
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
        <PreviewModalRefactored
          course={courseBuilder.course}
          lessons={courseBuilder.lessons}
          onClose={() => courseBuilder.setIsPreviewOpen(false)}
        />
      )}
      <AIGenerateModal
        isOpen={isAIGenerateOpen}
        onClose={() => setIsAIGenerateOpen(false)}
        onSubmit={handleAIGenerateSubmit}
        lessons={courseBuilder.lessons}
      />
      <AIHtmlGenerateModal
        isOpen={isAIHtmlGenerateOpen}
        onClose={() => setIsAIHtmlGenerateOpen(false)}
        onSubmit={handleAIHtmlGenerateSubmit}
        lessons={courseBuilder.lessons}
      />
      <HtmlPreviewModal
        isOpen={isHtmlPreviewOpen}
        onClose={() => setIsHtmlPreviewOpen(false)}
        htmlContent={generatedHtml.content}
        filename={generatedHtml.filename}
        onAddToLesson={() => {
          // Check if we have a selected lesson
          if (!courseBuilder.selectedLessonId) {
            toast.error("Please select a lesson first")
            return
          }

          // Add a new minigame field to the selected lesson
          const fieldId = courseBuilder.addField("minigame")

          // Create data URL for the field content so iframe preview works and no blob revocation issues
          const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(generatedHtml.content)}`

          // Update the field content
          courseBuilder.updateField(fieldId, {
            content: dataUrl,
            htmlContent: generatedHtml.content,
            htmlFilename: generatedHtml.filename,
          })

          // Switch to lessons tab and close modal
          setActiveEditorTab("lessons")
          setIsHtmlPreviewOpen(false)
          toast.success("HTML animation added to lesson!")

          // Attempt to reveal the new field in the editor
          setTimeout(() => {
            try {
              const el = document.getElementById(`field-${fieldId}`)
              if (el && typeof el.scrollIntoView === 'function') {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }
            } catch (e) { /* ignore */ }
          }, 300)
        }}
      />

      {/* Save Progress Indicator */}
      <ProgressBar
        progress={saveProgress.progress}
        status={saveProgress.status}
        message={saveProgress.message}
        error={saveProgress.error}
      />
    </div>
  )
}
