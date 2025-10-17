// /src/components/StudentSidebar.jsx
import React from "react"
import { CheckCircle2, PlayCircle } from "lucide-react"
import { Card, Button } from "../courseBuilder/UI"

export default function StudentSidebar({
  lessons,
  currentLessonId,
  completedLessons,
  onSelectLesson,
  progress,
}) {
  return (
    <aside className="w-80">
      <Card className="h-fit sticky top-24 p-6 border-2 hover:shadow-lg transition-shadow">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Lessons
        </h2>

        {/* Lesson List */}
        <div className="space-y-2">
          {lessons.map((lesson, idx) => {
            const isCompleted = completedLessons.includes(lesson.id)
            const isActive = currentLessonId === lesson.id
            return (
              <Button
                key={lesson.id}
                onClick={() => onSelectLesson(lesson.id)}
                variant="outline"
                className={`w-full justify-start text-left border-2 transition-all duration-150 ${
                  isActive
                    ? "border-blue-600 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100"
                    : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <PlayCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  )}
                  <span className="font-medium text-sm text-gray-900 truncate">
                    {idx + 1}. {lesson.title}
                  </span>
                </div>
              </Button>
            )
          })}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t-2 border-gray-200">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Progress: {progress}%
          </p>
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </Card>
    </aside>
  )
}
