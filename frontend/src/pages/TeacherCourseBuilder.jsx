// /src/pages/TeacherCourseBuilder.jsx
import React, { useState, useEffect } from "react"
import Header from "../components/courseBuilder/Header"
import Sidebar from "../components/courseBuilder/Sidebar"
import CourseInfo from "../components/courseBuilder/CourseInfo"
import LessonEditor from "../components/courseBuilder/LessonEditor"
import QuizSection from "../components/courseBuilder/QuizSection"
import PreviewModal from "../components/courseBuilder/PreviewModal"

export default function TeacherCourseBuilder() {
  /* ---------- STATE ---------- */
  const [saveStatus, setSaveStatus] = useState("saved")
  const [isQuizSectionOpen, setIsQuizSectionOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [draggedLessonId, setDraggedLessonId] = useState(null)
  const [draggedFieldId, setDraggedFieldId] = useState(null)

  const [course, setCourse] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    thumbnail: "",
    finalQuiz: { questions: [], passingScore: 70, points: 100 },
  })

  const [lessons, setLessons] = useState([
    { id: "1", title: "Lesson 1", fields: [] },
  ])
  const [selectedLessonId, setSelectedLessonId] = useState("1")

  const selectedLesson = lessons.find((l) => l.id === selectedLessonId)

  /* ---------- EFFECTS ---------- */
  // Auto-save to localStorage after 2s
  useEffect(() => {
    setSaveStatus("unsaved")
    const timeoutId = setTimeout(() => {
      setSaveStatus("saving")
      localStorage.setItem("course-data", JSON.stringify({ course, lessons }))
      console.log("[Auto-save] course data saved")
      setTimeout(() => setSaveStatus("saved"), 500)
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [course, lessons])

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem("course-data")
    if (saved) {
      try {
        const { course: c, lessons: l } = JSON.parse(saved)
        setCourse(c)
        setLessons(l)
        console.log("[Load] course data loaded")
      } catch (err) {
        console.error("Error loading saved data:", err)
      }
    }
  }, [])

  /* ---------- LESSON HANDLERS ---------- */
  const addLesson = () => {
    const newId = String(lessons.length + 1)
    setLessons([...lessons, { id: newId, title: `Lesson ${newId}`, fields: [] }])
    setSelectedLessonId(newId)
  }

  const deleteLesson = (id) => {
    if (lessons.length === 1) return
    const filtered = lessons.filter((l) => l.id !== id)
    setLessons(filtered)
    if (selectedLessonId === id) setSelectedLessonId(filtered[0].id)
  }

  const updateLessonTitle = (id, title) =>
    setLessons(lessons.map((l) => (l.id === id ? { ...l, title } : l)))

  /* ---------- FIELD HANDLERS ---------- */
  const addField = (type) => {
    if (!selectedLesson) return
    const newField = { id: `${selectedLesson.id}-${Date.now()}`, type, content: "" }
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: [...l.fields, newField] } : l
      )
    )
  }

  const deleteField = (fieldId) => {
    if (!selectedLesson) return
    const updated = selectedLesson.fields.filter((f) => f.id !== fieldId)
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: updated } : l
      )
    )
  }

  const updateField = (fieldId, content, htmlContent, language, answer, explanation) => {
    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId
          ? {
              ...l,
              fields: l.fields.map((f) =>
                f.id === fieldId
                  ? { ...f, content, htmlContent, language, answer, explanation }
                  : f
              ),
            }
          : l
      )
    )
  }

  const handleHtmlFileUpload = (fieldId, file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const htmlContent = e.target?.result
      updateField(fieldId, file.name, htmlContent)
    }
    reader.readAsText(file)
  }

  const handleImageUpload = (file, fieldId) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const url = e.target?.result
      if (fieldId) {
        updateField(fieldId, url)
      } else {
        setCourse({ ...course, thumbnail: url })
      }
    }
    reader.readAsDataURL(file)
  }

  /* ---------- DRAG HANDLERS (LESSONS) ---------- */
  const handleDragStart = (e, lessonId) => {
    setDraggedLessonId(lessonId)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleDragOver = (e) => e.preventDefault()
  const handleDrop = (e, targetLessonId) => {
    e.preventDefault()
    if (!draggedLessonId || draggedLessonId === targetLessonId) return

    const draggedIndex = lessons.findIndex((l) => l.id === draggedLessonId)
    const targetIndex = lessons.findIndex((l) => l.id === targetLessonId)
    const reordered = [...lessons]
    const [draggedLesson] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedLesson)
    setLessons(reordered)
    setDraggedLessonId(null)
  }
  const handleDragEnd = () => setDraggedLessonId(null)

  /* ---------- DRAG HANDLERS (FIELDS) ---------- */
  const handleFieldDragStart = (e, fieldId) => {
    setDraggedFieldId(fieldId)
    e.dataTransfer.effectAllowed = "move"
  }
  const handleFieldDragOver = (e) => e.preventDefault()
  const handleFieldDrop = (e, targetFieldId) => {
    e.preventDefault()
    if (!draggedFieldId || draggedFieldId === targetFieldId || !selectedLesson) return

    const draggedIndex = selectedLesson.fields.findIndex((f) => f.id === draggedFieldId)
    const targetIndex = selectedLesson.fields.findIndex((f) => f.id === targetFieldId)
    const reordered = [...selectedLesson.fields]
    const [draggedField] = reordered.splice(draggedIndex, 1)
    reordered.splice(targetIndex, 0, draggedField)

    setLessons(
      lessons.map((l) =>
        l.id === selectedLessonId ? { ...l, fields: reordered } : l
      )
    )
    setDraggedFieldId(null)
  }
  const handleFieldDragEnd = () => setDraggedFieldId(null)

  /* ---------- QUIZ HANDLERS ---------- */
  const addQuizQuestion = () => {
    const newQ = {
      id: `quiz-${Date.now()}`,
      question: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
    }
    setCourse({
      ...course,
      finalQuiz: {
        ...course.finalQuiz,
        questions: [...course.finalQuiz.questions, newQ],
      },
    })
  }

  const updateQuizQuestion = (id, field, value) =>
    setCourse({
      ...course,
      finalQuiz: {
        ...course.finalQuiz,
        questions: course.finalQuiz.questions.map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        ),
      },
    })

  const updateQuizOption = (id, optIndex, value) =>
    setCourse({
      ...course,
      finalQuiz: {
        ...course.finalQuiz,
        questions: course.finalQuiz.questions.map((q) =>
          q.id === id
            ? { ...q, options: q.options.map((opt, i) => (i === optIndex ? value : opt)) }
            : q
        ),
      },
    })

  const deleteQuizQuestion = (id) =>
    setCourse({
      ...course,
      finalQuiz: {
        ...course.finalQuiz,
        questions: course.finalQuiz.questions.filter((q) => q.id !== id),
      },
    })

  const updateQuizSettings = (field, value) =>
    setCourse({
      ...course,
      finalQuiz: { ...course.finalQuiz, [field]: value },
    })

  /* ---------- SAVE / PREVIEW ---------- */
  const handleSave = () => {
    console.log("Saving course:", { course, lessons })
    alert("Course saved successfully! (Check console for data)")
  }

  /* ---------- RENDER ---------- */
  return (
    <div className="min-h-screen bg-black-20">
      {/* Header */}
      <Header
        saveStatus={saveStatus}
        onPreview={() => setIsPreviewOpen(true)}
        onSave={handleSave}
      />

      {/* Main Layout */}
      <div className="container mx-auto px-6 py-8">
        <div className="flex gap-6">
          <Sidebar
            lessons={lessons}
            selectedLessonId={selectedLessonId}
            setSelectedLessonId={setSelectedLessonId}
            addLesson={addLesson}
            deleteLesson={deleteLesson}
            updateLessonTitle={updateLessonTitle}
            handleDragStart={handleDragStart}
            handleDragOver={handleDragOver}
            handleDrop={handleDrop}
            handleDragEnd={handleDragEnd}
            draggedLessonId={draggedLessonId}
          />

          {/* Editor */}
          <main className="flex-1 space-y-6">
            <CourseInfo
              course={course}
              setCourse={setCourse}
              handleImageUpload={handleImageUpload}
            />

            <LessonEditor
              selectedLesson={selectedLesson}
              draggedFieldId={draggedFieldId}
              handleFieldDragStart={handleFieldDragStart}
              handleFieldDragOver={handleFieldDragOver}
              handleFieldDrop={handleFieldDrop}
              handleFieldDragEnd={handleFieldDragEnd}
              addField={addField}
              deleteField={deleteField}
              updateField={updateField}
              handleHtmlFileUpload={handleHtmlFileUpload}
              handleImageUpload={handleImageUpload}
            />

            <QuizSection
              course={course}
              setCourse={setCourse}
              isQuizSectionOpen={isQuizSectionOpen}
              setIsQuizSectionOpen={setIsQuizSectionOpen}
              addQuizQuestion={addQuizQuestion}
              updateQuizQuestion={updateQuizQuestion}
              updateQuizOption={updateQuizOption}
              deleteQuizQuestion={deleteQuizQuestion}
              updateQuizSettings={updateQuizSettings}
            />
          </main>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <PreviewModal
          course={course}
          lessons={lessons}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </div>
  )
}
