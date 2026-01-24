// /src/components/StudentSidebar.jsx
import React, { useState } from "react"
import { CheckCircle2, PlayCircle, ChevronRight, Lock, Award, Zap } from "lucide-react"
import { Card, Button } from "../courseBuilder/UI"

export default function StudentSidebar({
  lessons,
  currentLessonId,
  completedLessons,
  onSelectLesson,
  progress,
  isEnrolled = true,
  isPreviewMode = false,
  finalQuiz,
  onOpenQuiz,
  isAllLessonsCompleted,
  isAIPanelOpen,
  onToggleAIPanel,
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside className={`transition-all duration-300 ${isCollapsed ? "w-20" : "w-80"}`}>
      <Card className={`h-fit sticky top-24 border-2 hover:shadow-lg transition-all duration-300 ${
        isCollapsed ? "p-3" : "p-6"
      }`}>
        {/* Header with Collapse Button */}
        <div className="flex items-center justify-between mb-4">
          {!isCollapsed && (
            <h2 className="text-lg font-bold text-gray-900">
              Lessons
            </h2>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <ChevronRight
              className={`w-5 h-5 text-gray-600 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

        {!isCollapsed && (
          <>
            {/* Lesson List */}
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const completedSet = new Set((completedLessons || []).map(String))
                const isCompleted = completedSet.has(String(lesson.id))
                const isActive = String(currentLessonId) === String(lesson.id)
                
                // In preview mode, all lessons should be accessible
                // In student mode, lock lessons if not enrolled
                const isLocked = isPreviewMode
                  ? false
                  : (!isEnrolled && !lesson.isPreview)
                
                return (
                  <Button
                    key={lesson.id}
                    onClick={() => !isLocked && onSelectLesson(lesson.id)}
                    variant="outline"
                    disabled={isLocked}
                    className={`w-full justify-start text-left border-2 transition-all duration-150 ${
                      isLocked
                        ? "border-gray-300 bg-gray-100 opacity-60 cursor-not-allowed"
                        : isActive
                        ? "border-blue-600 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100"
                        : "border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {isLocked ? (
                        <Lock className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      ) : (
                        <PlayCircle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      )}
                      <span className="font-medium text-sm text-gray-900 truncate">
                        {idx + 1}. {lesson.title}
                      </span>
                      {lesson.isPreview && (
                        <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          {isPreviewMode ? "Unlocked" : "Free"}
                        </span>
                      )}
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

            {/* Quiz Section */}
            {finalQuiz && (
              <div className="mt-6 pt-4 border-t-2 border-gray-200">
                <div className={`p-4 rounded-lg border-2 transition-all ${
                  isAllLessonsCompleted
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-gray-300 bg-gray-50"
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isAllLessonsCompleted
                        ? "bg-yellow-600"
                        : "bg-gray-400"
                    }`}>
                      {isAllLessonsCompleted ? (
                        <Award className="w-5 h-5 text-white" />
                      ) : (
                        <Lock className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-900 mb-1">
                        Final Quiz
                      </h3>
                      {isAllLessonsCompleted ? (
                        <>
                          <p className="text-xs text-gray-600 mb-3">
                            You've completed all lessons! Ready to test your knowledge?
                          </p>
                          <button
                            onClick={() => {
                              try {
                                // Safety log to ensure handler exists
                                // eslint-disable-next-line no-console
                                console.log("StudentSidebar: Take Quiz clicked", { onOpenQuiz })
                                if (typeof onOpenQuiz === "function") onOpenQuiz()
                              } catch (e) {
                                // eslint-disable-next-line no-console
                                console.error("Error invoking onOpenQuiz:", e)
                              }
                            }}
                            className="w-full px-3 py-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white rounded-lg text-sm font-medium transition-all shadow-md hover:shadow-lg"
                          >
                            Take Quiz
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Complete all lessons to unlock the quiz
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Assistant Button */}
            {/* <div className="mt-6 pt-4 border-t-2 border-gray-200">
              <button
                onClick={onToggleAIPanel}
                className={`w-full px-4 py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                  isAIPanelOpen
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900 border-2 border-gray-300"
                }`}
              >
                <Zap className="w-5 h-5" />
                {isAIPanelOpen ? "Close AI" : "Open AI"}
              </button>
            </div> */}
          </>
        )}

        {isCollapsed && (
          <>
            {/* Collapsed Lesson Icons */}
            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const completedSet = new Set((completedLessons || []).map(String))
                const isCompleted = completedSet.has(String(lesson.id))
                const isActive = String(currentLessonId) === String(lesson.id)
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`w-full p-2 rounded-lg transition-all flex items-center justify-center ${
                      isActive
                        ? "bg-blue-600"
                        : isCompleted
                        ? "bg-green-600"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                    title={lesson.title}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : isActive ? (
                      <PlayCircle className="w-5 h-5 text-white" />
                    ) : (
                      <span className="text-xs font-bold text-white">
                        {idx + 1}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Collapsed Quiz Button */}
            {finalQuiz && isAllLessonsCompleted && (
              <button
                onClick={() => {
                  try {
                    // eslint-disable-next-line no-console
                    console.log("StudentSidebar (collapsed): Take Quiz clicked", { onOpenQuiz })
                    if (typeof onOpenQuiz === "function") onOpenQuiz()
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error("Error invoking onOpenQuiz (collapsed):", e)
                  }
                }}
                className="w-full mt-4 p-2 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white transition-all flex items-center justify-center"
                title="Take Quiz"
              >
                <Award className="w-5 h-5" />
              </button>
            )}

            {/* Collapsed AI Button */}
            <button
              onClick={onToggleAIPanel}
              className={`w-full mt-2 p-2 rounded-lg transition-all flex items-center justify-center ${
                isAIPanelOpen
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-white"
              }`}
              title="Toggle AI Assistant"
            >
              <Zap className="w-5 h-5" />
            </button>
          </>
        )}
      </Card>
    </aside>
  )
}
