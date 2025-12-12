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
}) {
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState({})

  const handleAnswerSubmit = (fieldId, userAnswer, correctAnswer) => {
    const isCorrect =
      userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
    setFeedback({
      ...feedback,
      [fieldId]: isCorrect ? "correct" : "incorrect",
    })
    setAnswers({
      ...answers,
      [fieldId]: userAnswer,
    })
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
            />
          ))}
        </div>
      )}

      {/* Mark Complete Button */}
      {!completed && (
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
      {completed && (
        <div className="pt-6 border-t border-gray-200 text-center text-green-600 font-semibold flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Completed
        </div>
      )}
    </Card>
  )
}

/* ---------------- FIELD RENDERER ---------------- */

function FieldRenderer({ field, feedback, answer, onAnswerSubmit }) {
  switch (field.type) {
    case "paragraph":
      return (
        <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
          {field.content}
        </p>
      )

    case "image":
      return (
        <i
          src={field.content}
          alt="Lesson visual"
          className="rounded-lg w-full border-2 border-gray-300 object-cover"
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

    case "question":
      return (
        <div className="p-6 rounded-xl border-2 border-orange-200 bg-orange-50 space-y-3">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-gray-900 ">
              {field.content}
            </p>
          </div>
          <Input
            placeholder="Type your answer..."
            value={answer || ""}
            onChange={(e) => onAnswerSubmit(field.id, e.target.value, "")}
            onBlur={(e) =>
              onAnswerSubmit(field.id, e.target.value, field.answer || "")
            }
            className="border-2 border-gray-300 "
          />
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
      return <AnimationRenderer animationId={field.animationId} />

    default:
      return null
  }
}
