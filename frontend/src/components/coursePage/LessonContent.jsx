// /src/components/LessonContent.jsx
import React, { useState, useRef } from "react"
import {
  ImageIcon,
  Youtube,
  Code2,
  HelpCircle,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  XCircle,
  Maximize2,
  Download,
} from "lucide-react"
import axios from "axios"
import { Card, Button, Textarea, Input, Select } from "../courseBuilder/UI"
import AnimationRenderer from "./AnimationRenderer"
import { downloadHtml } from "../../utils/courseBuilderUtils"
import toast from "react-hot-toast"

export default function LessonContent({
  lesson,
  onCompleteLesson,
  completed,
  isEnrolled = true,
  isPreviewMode = false,
  onEnroll,
}) {
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState({})

  const handleAnswerSubmit = (fieldId, userAnswer, correctAnswer) => {
    const ua = String(userAnswer || "").trim().toLowerCase()
    const ca = String(correctAnswer || "").trim().toLowerCase()
    const isCorrect = ua === ca
    setFeedback((prev) => ({ ...prev, [fieldId]: isCorrect ? "correct" : "incorrect" }))
    setAnswers((prev) => ({ ...prev, [fieldId]: userAnswer }))
  }

  if (!lesson)
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>No lesson selected.</p>
      </Card>
    )

  return (
    <Card className="p-8 border-2 hover:shadow-lg transition-shadow space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">
        {lesson.title}
      </h2>
      
      {/* Preview Badge */}
      {lesson.isPreview && !isPreviewMode && (
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-green-800">
            <span className="font-semibold">Free Preview</span> - This lesson is available to everyone
          </p>
        </div>
      )}
      
      {/* Preview Mode Indicator for Teacher */}
      {isPreviewMode && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Preview Mode</span> - This is how students will see this lesson
          </p>
        </div>
      )}

      {lesson.fields.length === 0 ? (
        <p className="text-sm text-gray-500 italic">
          This lesson has no content yet.
        </p>
      ) : (
        <div className="space-y-8">
          {lesson.fields.map((field) => (
            <FieldRenderer
              key={field.id}
              field={field}
              isPreviewMode={isPreviewMode}
              feedback={feedback[field.id]}
              answer={answers[field.id]}
              onAnswerSubmit={handleAnswerSubmit}
              onAnswerChange={(val) => setAnswers((prev) => ({ ...prev, [field.id]: val }))}
            />
          ))}
        </div>
      )}
      
      {/* Enrollment CTA for non-enrolled users viewing preview lesson (not in preview mode) */}
      {!isPreviewMode && !isEnrolled && lesson.isPreview && (
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-lg">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Want to continue learning?
          </h3>
          <p className="text-gray-700 mb-4">
            Enroll now to access all lessons, quizzes, and earn your certificate!
          </p>
          <Button
            onClick={onEnroll}
            className="gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
          >
            Enroll in This Course
          </Button>
        </div>
      )}

      {/* Mark Complete Button - only for enrolled users in student mode */}
      {!isPreviewMode && isEnrolled && !completed && (
        <div className="pt-6 border-t border-gray-200 text-center">
          <Button
            onClick={onCompleteLesson}
            className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Lesson Complete
          </Button>
        </div>
      )}
      {!isPreviewMode && isEnrolled && completed && (
        <div className="pt-6 border-t border-gray-200 text-center text-green-600 font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Completed
        </div>
      )}
    </Card>
  )
}

/* ---------------- FIELD RENDERER ---------------- */

function FieldRenderer({ field, feedback, answer, onAnswerSubmit, onAnswerChange, isPreviewMode }) {

  switch (field.type) {
    case "paragraph":
      return (
        <div 
          className="text-gray-800 leading-relaxed prose prose-sm max-w-none mq-prose"
          dangerouslySetInnerHTML={{ __html: field.content }}
        />
      )

    case "image":
      return (
        <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-white">
          <img
            src={field.content}
            alt="Lesson visual"
            className="h-full w-auto max-w-full object-contain"
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg"
            }}
            style={{ display: 'block' }}
          />
        </div>
      )

    case "youtube":
      return (
        <div className="aspect-video w-full rounded-lg overflow-hidden border-2 border-gray-300">
          <iframe
            src={field.content.replace("watch?v=", "embed/")}
            title="YouTube Video"
            allowFullScreen
            className="w-full h-full"
          />
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

    case "question":
      return (
        <div className="p-6 rounded-xl space-y-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-gray-900 ">
              {field.content}
            </p>
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Type your answer..."
              value={answer || ""}
              onChange={(e) => onAnswerChange && onAnswerChange(e.target.value)}
              className="border-2 border-gray-300 flex-1"
            />
            <Button
              onClick={() => onAnswerSubmit(field.id, answer || "", field.correctAnswer || field.answer || "")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              Submit
            </Button>
          </div>
          {feedback === "correct" && (
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                Correct!
              </p>
              {field.explanation && (
                <p className="text-gray-700"><strong>Explanation:</strong> {field.explanation}</p>
              )}
            </div>
          )}

          {feedback === "incorrect" && (
            <div className="space-y-1 text-sm">
              <p className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                Incorrect.
              </p>
              {(field.correctAnswer || field.answer) && (
                <p className="text-gray-800"><strong>Correct answer:</strong> {field.correctAnswer || field.answer}</p>
              )}
              {field.explanation && (
                <p className="text-gray-700"><strong>Explanation:</strong> {field.explanation}</p>
              )}
            </div>
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
        <div className="space-y-2">
          <div className="rounded-lg border-2 border-gray-300 overflow-hidden relative">
            <div className="absolute bottom-2 right-2 z-10 flex gap-2">
              {field.htmlContent && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    try {
                      downloadHtml(
                        field.htmlContent,
                        field.htmlFilename || 'animation.html'
                      )
                      toast.success('HTML file downloaded')
                    } catch (err) {
                      toast.error('Failed to download HTML')
                    }
                  }}
                  className="bg-purple-600/90 hover:bg-purple-700 text-white border border-white/20 shadow-sm h-9 px-3"
                  aria-label="Download HTML"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
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
              className="w-full min-h-[500px] bg-white"
              title={field.type}
              sandbox="allow-scripts"
              allow="fullscreen"
            />
          </div>
        </div>
      )

    case "animation":
      console.log('Rendering animation field:', { field })
      const playbackMode = field.animationPreviewMode || "start-stop"
      return (
        <div className="space-y-2">
          <AnimationRenderer
            animationId={field.animationId}
            playbackMode={playbackMode}
          />
        </div>
      )

    default:
      return null
  }
}
