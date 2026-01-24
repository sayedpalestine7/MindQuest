import React from "react"
import { Award, Plus, Trash2, Check, ChevronLeft, BookOpen } from "lucide-react"
import { Button, Input, Textarea, Card } from "./UI"
import { useStickyVisibility } from "../../hooks/useStickyVisibility"

/**
 * Quiz Editor component - displays in the main editor area (right side)
 * Similar to LessonEditor but for quiz questions
 */
export default function QuizEditor({
    course,
    addQuizQuestion,
    updateQuizQuestion,
    updateQuizOption,
    deleteQuizQuestion,
    updateQuizSettings,
    onNavigateToLessons,
}) {
    const quiz = course.finalQuiz
    const { stickyRef, stickyClassName } = useStickyVisibility()

    return (
        <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={onNavigateToLessons}
                    className="mb-4 gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 pl-2 font-semibold transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    ← Back to Lessons
                </Button>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center shadow-md">
                            <Award className="w-6 h-6 text-white" />
                        </div>
                        Final Quiz
                        {quiz?.questions.length > 0 && (
                            <span className="text-sm font-normal text-gray-500">
                                ({quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''})
                            </span>
                        )}
                    </h2>
                </div>
            </div>

            {/* Quiz Settings - STICKY */}
                        <div ref={stickyRef} className={`top-0 z-10 mb-6 p-4 rounded-xl border-2 border-gray-300 shadow-md ${stickyClassName}`}>
                            <p className="text-sm font-semibold text-gray-800 mb-3">Quiz Settings</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Passing Score (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={quiz?.passingScore ?? 70}
                                        onChange={(e) =>
                                            updateQuizSettings("passingScore", Number(e.target.value))
                                        }
                                        className="border-2 border-gray-300"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Course Points
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={quiz?.points ?? 100}
                                        onChange={(e) =>
                                            updateQuizSettings("points", Number(e.target.value))
                                        }
                                        className="border-2 border-gray-300"
                                    />
                                </div>
                            </div>
                            <div className="mt-3">
                                <Button
                                    onClick={addQuizQuestion}
                                    className="w-full gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg transition-all"
                                    variant="defualt"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Quiz Question
                                </Button>
                            </div>
                        </div>

            {/* Questions List */}
            <div className="space-y-4">
                {quiz?.questions.length > 0 ? (
                    quiz.questions.map((question, qIndex) => (
                        <div
                            key={question.id}
                            className="p-6 bg-white rounded-xl border-2 border-gray-300 hover:border-yellow-400 transition-colors"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                                        {qIndex + 1}
                                    </span>
                                    Question {qIndex + 1}
                                </h3>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => deleteQuizQuestion(question.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>

                            {/* Question Text */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Question
                                    </label>
                                    <Textarea
                                        value={question.question}
                                        onChange={(e) =>
                                            updateQuizQuestion(question.id, "question", e.target.value)
                                        }
                                        placeholder="Enter the quiz question..."
                                        rows={2}
                                        className="border-2 border-gray-300 resize-none"
                                    />
                                </div>

                                {/* Question Type */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={question.type || "mcq"}
                                        onChange={(e) => {
                                            const prevType = question.type || "mcq";
                                            const nextType = e.target.value;
                                            updateQuizQuestion(question.id, "type", nextType);

                                            if (nextType === "mcq") {
                                                if (prevType !== "mcq") {
                                                    updateQuizQuestion(question.id, "options", ["", "", "", ""]);
                                                    updateQuizQuestion(question.id, "correctAnswerIndex", 0);
                                                } else if (!Array.isArray(question.options) || question.options.length < 2) {
                                                    updateQuizQuestion(question.id, "options", ["", "", "", ""]);
                                                    updateQuizQuestion(question.id, "correctAnswerIndex", 0);
                                                }
                                                updateQuizQuestion(question.id, "correctAnswer", "");
                                            } else if (nextType === "tf") {
                                                updateQuizQuestion(question.id, "options", ["True", "False"]);
                                                updateQuizQuestion(question.id, "correctAnswerIndex", 0);
                                                updateQuizQuestion(question.id, "correctAnswer", "True");
                                            } else if (nextType === "short") {
                                                updateQuizQuestion(question.id, "options", []);
                                                updateQuizQuestion(question.id, "correctAnswerIndex", 0);
                                                if (prevType !== "short") {
                                                    updateQuizQuestion(question.id, "correctAnswer", "");
                                                }
                                            }
                                        }}
                                        className="mt-1 block w-full border-2 border-gray-300 rounded-lg p-2"
                                    >
                                        <option value="mcq">Multiple Choice (mcq)</option>
                                        <option value="tf">True / False (t/f)</option>
                                        <option value="short">Short Answer (short)</option>
                                    </select>
                                </div>

                                {/* Answer Editor - MCQ */}
                                {(question.type || "mcq") === "mcq" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Answer Options
                                        </label>
                                        <div className="space-y-2">
                                            {(question.options || []).map((option, optIndex) => (
                                                <div key={optIndex} className="flex items-center gap-2">
                                                    <input
                                                        type="radio"
                                                        name={`correct-${question.id}`}
                                                        checked={question.correctAnswerIndex === optIndex}
                                                        onChange={() =>
                                                            updateQuizQuestion(
                                                                question.id,
                                                                "correctAnswerIndex",
                                                                optIndex
                                                            )
                                                        }
                                                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                                    />
                                                    <Input
                                                        value={option}
                                                        onChange={(e) =>
                                                            updateQuizOption(question.id, optIndex, e.target.value)
                                                        }
                                                        placeholder={`Option ${optIndex + 1}`}
                                                        className="border-2 border-gray-300 flex-1"
                                                    />
                                                    {question.correctAnswerIndex === optIndex && (
                                                        <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Select the radio button next to the correct answer
                                        </p>
                                    </div>
                                )}

                                {/* Answer Editor - True/False */}
                                {(question.type || "mcq") === "tf" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Correct Answer
                                        </label>
                                        <div className="flex gap-4">
                                            {["True", "False"].map((val) => (
                                                <label key={val} className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name={`tf-${question.id}`}
                                                        checked={(question.correctAnswer || "True") === val}
                                                        onChange={() => updateQuizQuestion(question.id, "correctAnswer", val)}
                                                        className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                                                    />
                                                    <span className="text-sm font-medium text-gray-700">{val}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Answer Editor - Short Answer */}
                                {(question.type || "mcq") === "short" && (
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Correct Answer
                                        </label>
                                        <Textarea
                                            value={question.correctAnswer || ""}
                                            onChange={(e) => updateQuizQuestion(question.id, "correctAnswer", e.target.value)}
                                            placeholder="Enter the expected answer..."
                                            rows={2}
                                            className="border-2 border-gray-300 resize-none"
                                        />
                                    </div>
                                )}

                                {/* Points */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Points
                                    </label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={question.points ?? 1}
                                        onChange={(e) =>
                                            updateQuizQuestion(question.id, "points", Number(e.target.value) || 1)
                                        }
                                        className="border-2 border-gray-300"
                                    />
                                </div>

                                {/* Explanation */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Explanation (Optional)
                                    </label>
                                    <Textarea
                                        value={question.explanation || ""}
                                        onChange={(e) =>
                                            updateQuizQuestion(question.id, "explanation", e.target.value)
                                        }
                                        placeholder="Provide an explanation for the correct answer..."
                                        rows={2}
                                        className="border-2 border-gray-300 resize-none"
                                    />
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 px-6 rounded-xl border-2 border-dashed border-gray-300">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-100 mb-4">
                            <Award className="w-8 h-8 text-yellow-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Create Your Final Quiz</h3>
                        <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                            Test your students' understanding with a variety of question types: Multiple Choice, True/False, and Short Answer.
                        </p>
                        <p className="text-xs text-gray-500">Click "Add Quiz Question" above to create your first question</p>
                    </div>
                )}
            </div>

            {/* Workflow Navigation */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
              <p className="text-sm text-gray-600"><span className="font-semibold">Quiz ready?</span> Go back to edit lessons or save your course.</p>
              <Button
                onClick={onNavigateToLessons}
                variant="defualt"
                className="gap-2 text-white bg-amber-600 hover:bg-amber-700"
              >
                <BookOpen className="w-4 h-4" />
                Back to Lessons
              </Button>
            </div>
        </Card>
    )
}
