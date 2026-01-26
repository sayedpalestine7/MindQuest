// /src/components/PreviewModal.jsx
import React, { useRef } from "react"
import {
  X,
  Eye,
  BookOpen,
  Youtube,
  HelpCircle,
  Maximize2,
} from "lucide-react"
import AnimationRenderer from "../coursePage/AnimationRenderer"
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
        <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-white">
          <img
            src={field.content || "/placeholder.svg"}
            alt="Lesson content"
            className="h-full w-auto max-w-full object-contain"
            style={{ display: 'block' }}
          />
        </div>
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
        <div className="p-4 rounded-lg bg-orange-50">
          <div className="flex items-start gap-2 mb-3">
            <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="text-gray-900 font-medium">
              {field.content}
            </p>
          </div>
          <p className="text-sm text-gray-600 italic">
            Answer: {(field.correctAnswer ?? field.answer) || "No answer provided"}
          </p>
          {field.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              Explanation: {field.explanation}
            </p>
          )}
        </div>
      )

    case "minigame":
      const iframeRef = useRef(null)
      const handleFullscreen = () => {
        const el = iframeRef.current
        if (!el) return
        const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
        if (request) request.call(el)
      }
      return (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden relative">
          <div className="absolute bottom-2 right-2 z-10">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleFullscreen}
              className="bg-black/60 hover:bg-black/75 text-white border border-white/20 shadow-sm h-9 w-9 p-0"
              aria-label="Full screen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
          <iframe
            ref={iframeRef}
            src={field.content}
            className="w-full min-h-[600px] bg-white"
            title="Mini-game"
            sandbox="allow-scripts"
            allow="fullscreen"
          />
        </div>
      )

    case "table":
      const tableData = field.content || { rows: 0, columns: 0, data: [] }
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-gray-300">
            <tbody>
              {tableData.data && tableData.data.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row && row.map((cell, colIndex) => (
                    <td 
                      key={colIndex} 
                      className="border border-gray-300 px-4 py-2 text-gray-800"
                    >
                      {cell || ""}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "animation":
      return (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden p-4 bg-white">
          <div className="text-xs text-gray-500 mb-2">Animation ID: <span className="font-mono text-sm text-gray-700">{field.animationId || '—'}</span></div>
          <AnimationRenderer
            animationId={field.animationId}
            playbackMode={field.animationPreviewMode || "start-stop"}
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
