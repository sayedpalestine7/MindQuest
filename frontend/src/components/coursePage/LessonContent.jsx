// /src/components/LessonContent.jsx
import React, { useState } from "react"
import {
  ImageIcon,
  Youtube,
  Code2,
  HelpCircle,
  Gamepad2,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import axios from "axios"
import { Card, Button, Textarea, Input, Select } from "../courseBuilder/UI"
import AnimationRenderer from "./AnimationRenderer"

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
            {!lesson.isPreview && " (locked for non-enrolled students)"}
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

function FieldRenderer({ field, feedback, answer, onAnswerSubmit, onAnswerChange }) {
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
        <img
          src={field.content}
          alt="Lesson visual"
          className="rounded-lg w-full max-h-96 object-contain"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.svg"
          }}
        />
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
        <div className="p-6 rounded-xl border-2 space-y-3">
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
            <p className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Correct!
            </p>
          )}
          {feedback === "incorrect" && (
            <p className="flex items-center gap-2 text-red-600 text-sm">
              <XCircle className="w-4 h-4" />
              Incorrect. Try again.
            </p>
          )}
        </div>
      )

    case "minigame":
      return (
        <div className="rounded-lg border-2 border-gray-300 overflow-hidden">
          <iframe
            srcDoc={field.htmlContent}
            className="w-full min-h-[500px] bg-white"
            title={field.type}
            sandbox="allow-scripts"
          />
        </div>
      )

    case "animation":
      console.log('Rendering animation field:', { field })
      return (
        <div className="space-y-2">
          {/* <div className="text-xs text-gray-500">Animation ID: <span className="font-mono text-sm text-gray-700">{field.animationId || '—'}</span></div> */}
          <AnimationRenderer animationId={field.animationId} />
        </div>
      )

    default:
      return null
  }
}
