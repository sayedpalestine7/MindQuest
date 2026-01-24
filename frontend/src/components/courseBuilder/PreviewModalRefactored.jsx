// /src/components/courseBuilder/PreviewModalRefactored.jsx
/**
 * PreviewModalRefactored - Full-screen preview using StudentCoursePageWrapper
 * 
 * This replaces the old PreviewModal with a pixel-perfect preview that reuses
 * the exact same components as the real student view.
 * 
 * Key features:
 * - Full-screen modal overlay
 * - Embedded StudentCoursePageWrapper in preview mode
 * - Mock student data (progress, enrollment, etc.)
 * - No persistence to database or localStorage
 * - Close button to return to course builder
 */
import React from "react"
import { X } from "lucide-react"
import StudentCoursePageWrapper from "../coursePage/StudentCoursePageWrapper"

export default function PreviewModalRefactored({ course, lessons, onClose, hideHeader = false }) {
  if (!course) return null

  // Format lessons for preview - ensure all required fields are present
  const formattedLessons = (lessons || []).map((lesson) => ({
    id: String(lesson.id),
    title: lesson.title || "Untitled Lesson",
    isPreview: lesson.isPreview || false,
    fields: (lesson.fields || []).map((field) => {
      let content = field.content
      if (field.type === "table" && (!content || typeof content !== "object" || !content.data)) {
        content = {
          rows: 3,
          columns: 3,
          data: Array(3).fill(null).map(() => Array(3).fill(""))
        }
      }
      return {
        id: String(field.id),
        type: field.type,
        content: content,
        animationId: field.animationId || null,
        animationPreviewMode: field.animationPreviewMode || "start-stop",
        correctAnswer: field.correctAnswer || field.answer || "",
        questionType: field.questionType || null,
        options: field.options || [],
        correctAnswerIndex: field.correctAnswerIndex,
        points: field.points || 1,
        explanation: field.explanation || "",
      }
    }),
  }))

  // Transform quiz data for preview if it exists
  const previewQuiz = course.finalQuiz ? {
    ...course.finalQuiz,
    questions: course.finalQuiz.questions || []
  } : null

  // Mock teacher user data for preview header
  const mockTeacherUser = {
      // keep _id null so StudentHeader doesn't attempt backend lookups
      _id: null,
    name: "Teacher (Preview Mode)",
    profileImage: null,
    avatar: null,
  }

  // Handle click on backdrop (outside content)
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Close Button - Floating top-right */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        title="Close Preview"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Preview Content - Full screen with scroll */}
      <div className="w-full h-full overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <StudentCoursePageWrapper
          mode="preview"
          previewCourse={{
            id: course.id || "preview-course-id",
            title: course.title || "Untitled Course",
            description: course.description || "No description",
            difficulty: course.difficulty || "beginner",
            price: course.price ?? 0,
            finalQuiz: previewQuiz,
          }}
          previewLessons={formattedLessons}
          previewQuiz={previewQuiz}
          previewUser={mockTeacherUser}
          onPreviewClose={onClose}
          hideHeader={hideHeader}
        />
      </div>
    </div>
  )
}
