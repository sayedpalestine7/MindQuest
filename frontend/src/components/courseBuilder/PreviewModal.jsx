// /src/components/PreviewModal.jsx
import React from "react"
import {
  X,
  Eye,
  BookOpen,
  Youtube,
  HelpCircle,
} from "lucide-react"
import { Card, Button } from "./UI"

export default function PreviewModal({ course, lessons, onClose }) {
  if (!course) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border-2 border-gray-300 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden animate-zoomIn">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Course Preview
              </h2>
              <p className="text-sm text-gray-500">Student View</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-red-50"
          >
            <X className="w-5 h-5 text-red-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-88px)] p-8 space-y-6">
          
          {/* Course Header */}
          <div className="space-y-4">
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-48 object-cover rounded-xl border-2 border-gray-300"
              />
            )}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  {course.difficulty?.toUpperCase()}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {course.title || "Untitled Course"}
              </h1>
              <p className="text-gray-600">
                {course.description || "No description provided."}
              </p>
            </div>
          </div>

          {/* Lessons */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Lessons ({lessons.length})
            </h2>
            {lessons.map((lesson, index) => (
              <Card key={lesson.id} className="p-6 border-2 border-gray-300">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                    {index + 1}
                  </span>
                  {lesson.title}
                </h3>

                {lesson.fields.length === 0 ? (
                  <p className="text-sm text-gray-500 italic">
                    No content in this lesson yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {lesson.fields.map((field) => (
                      <FieldPreview key={field.id} field={field} />
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* --- Helper: Field rendering --- */
function FieldPreview({ field }) {
  switch (field.type) {
    case "paragraph":
      return (
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {field.content || "Empty paragraph"}
        </p>
      )

    case "image":
      return (
        <img
          src={field.content || "/placeholder.svg"}
          alt="Lesson content"
          className="w-full rounded-lg border-2 border-gray-300"
        />
      )

    case "youtube":
      return (
        <div className="aspect-video rounded-lg border-2 border-gray-300 overflow-hidden bg-gray-100 flex items-center justify-center">
          <Youtube className="w-12 h-12 text-gray-500" />
          <p className="ml-2 text-sm text-gray-500">{field.content}</p>
        </div>
      )

    case "code":
      return (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden">
          <div className="bg-gray-100 px-4 py-2 border-b border-gray-300">
            <span className="text-xs font-semibold text-gray-600 uppercase">
              {field.language || "code"}
            </span>
          </div>
          <pre className="p-4 bg-white overflow-x-auto">
            <code className="text-sm font-mono text-gray-800">
              {field.content}
            </code>
          </pre>
        </div>
      )

    case "question":
      return (
        <div className="p-4 rounded-lg border-2 border-orange-200 bg-orange-50">
          <div className="flex items-start gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-900 font-medium">
              {field.content}
            </p>
          </div>
          <p className="text-sm text-gray-600 italic">
            Answer: {field.answer || "No answer provided"}
          </p>
          {field.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              Explanation: {field.explanation}
            </p>
          )}
        </div>
      )

    case "minigame":
    case "animation":
      return (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden">
          <iframe
            srcDoc={field.htmlContent}
            className="w-full min-h-[600px] bg-white"
            title={field.type === "minigame" ? "Mini-game" : "Animation"}
            sandbox="allow-scripts"
          />
        </div>
      )

    default:
      return null
  }
}

/* --- Animations --- */
const style = document.createElement("style")
style.innerHTML = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.2s ease-out; }
.animate-zoomIn { animation: zoomIn 0.2s ease-out; }
`
document.head.appendChild(style)
