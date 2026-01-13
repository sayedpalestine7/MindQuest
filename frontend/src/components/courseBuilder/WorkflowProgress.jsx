// /src/components/courseBuilder/WorkflowProgress.jsx
import React from "react"
import { CheckCircle2, Circle, BookOpen, GraduationCap, HelpCircle } from "lucide-react"

/**
 * Workflow progress indicator showing course creation steps
 * @param {object} course - Course data
 * @param {Array} lessons - Lessons array
 */
export default function WorkflowProgress({ course, lessons }) {
    // Determine completion status
    const isCourseInfoComplete = course.title?.trim() && course.description?.trim()
    const hasLessons = lessons.length > 0
    const hasQuiz = course.finalQuiz?.questions?.length > 0

    const steps = [
        {
            id: "info",
            label: "Course Info",
            icon: BookOpen,
            completed: isCourseInfoComplete,
            description: isCourseInfoComplete ? "Complete" : "Add title & description",
        },
        {
            id: "lessons",
            label: "Lessons",
            icon: GraduationCap,
            completed: hasLessons,
            description: hasLessons ? `${lessons.length} lesson${lessons.length !== 1 ? 's' : ''}` : "Add lessons",
        },
        {
            id: "quiz",
            label: "Quiz",
            icon: HelpCircle,
            completed: hasQuiz,
            description: hasQuiz ? `${course.finalQuiz.questions.length} question${course.finalQuiz.questions.length !== 1 ? 's' : ''}` : "Optional",
            optional: true,
        },
    ]

    return (
        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
                {steps.map((step, index) => {
                    const Icon = step.icon
                    const isCompleted = step.completed

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step */}
                            <div className="flex items-center gap-3">
                                {/* Icon */}
                                <div
                                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isCompleted
                                            ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                            : "bg-white text-gray-400 border-2 border-gray-300"
                                        }`}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>

                                {/* Label */}
                                <div>
                                    <div
                                        className={`text-sm font-semibold ${isCompleted ? "text-green-700" : "text-gray-600"
                                            }`}
                                    >
                                        {step.label}
                                        {step.optional && (
                                            <span className="ml-1 text-xs text-gray-500">(optional)</span>
                                        )}
                                    </div>
                                    <div className="text-xs text-gray-500">{step.description}</div>
                                </div>
                            </div>

                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={`flex-1 h-0.5 mx-4 transition-colors ${isCompleted ? "bg-green-400" : "bg-gray-300"
                                        }`}
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}
