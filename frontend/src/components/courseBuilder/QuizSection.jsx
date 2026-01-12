// /src/components/QuizSection.jsx
import React from "react"
import { Award, ChevronRight, Plus, Trash2, Check } from "lucide-react"
import { Button, Input, Textarea, Card } from "./UI"

export default function QuizSection({
  course,
  setCourse,
  isQuizSectionOpen,
  setIsQuizSectionOpen,
  addQuizQuestion,
  updateQuizQuestion,
  updateQuizOption,
  deleteQuizQuestion,
  updateQuizSettings,
}) {
  const quiz = course.finalQuiz

  return (
    <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
      {/* Collapsible Header */}
      <button
        onClick={() => setIsQuizSectionOpen(!isQuizSectionOpen)}
        className="w-full flex items-center justify-between mb-6 group"
      >
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          Final Quiz
          {quiz?.questions.length > 0 && (
            <span className="text-sm font-normal text-gray-500">
              ({quiz.questions.length} questions)
            </span>
          )}
        </h2>
        <div
          className={`transition-transform duration-200 ${isQuizSectionOpen ? "rotate-90" : ""
            }`}
        >
          <ChevronRight className="w-6 h-6 text-gray-500 group-hover:text-gray-800" />
        </div>
      </button>

      {/* Quiz Content (Collapsible Body) */}
      {isQuizSectionOpen && (
        <div className="space-y-6 animate-in slide-in-from-top-2 duration-200">
          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl border-2 border-gray-3">
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
                className="border-2 border-gray-3"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-7 mb-2">
                Course Points
              </label>
              <Input
                type="number"
                min="0"
                value={quiz?.points ?? 100}
                onChange={(e) =>
                  updateQuizSettings("points", Number(e.target.value))
                }
                className="border-2 border-gray-3"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="space-y-4">
            {quiz?.questions.length > 0 ? (
              quiz.questions.map((question, qIndex) => (
                <Card
                  key={question.id}
                  className="p-6 border-2 border-gray-3"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-9 flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-orange-600 flex items-center justify-center text-white text-sm font-bold">
                        {qIndex + 1}
                      </span>
                      Question {qIndex + 1}
                    </h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteQuizQuestion(question.id)}
                      className="h-8 w-8 p-0 hover:bg-red-"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>

                  {/* Question Text */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
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
                            // If coming from tf/short, don't keep ['True','False'] or []
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
                            // If coming from tf, clear the default 'True' text
                            if (prevType !== "short") {
                              updateQuizQuestion(question.id, "correctAnswer", "");
                            }
                          }
                        }}
                        className="mt-1 block w-full border-gray-200 rounded p-2"
                      >
                        <option value="mcq">Multiple Choice (mcq)</option>
                        <option value="tf">True / False (t/f)</option>
                        <option value="short">Short Answer (short)</option>
                      </select>
                    </div>

                    {/* Answer Editor */}
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

                    {(question.type || "mcq") === "tf" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Correct Answer
                        </label>
                        <div className="space-y-2">
                          {["True", "False"].map((val) => (
                            <label key={val} className="inline-flex items-center gap-2">
                              <input
                                type="radio"
                                name={`tf-${question.id}`}
                                checked={(question.correctAnswer || "True") === val}
                                onChange={() => updateQuizQuestion(question.id, "correctAnswer", val)}
                                className="w-4 h-4 text-yellow-600 focus:ring-yellow-500"
                              />
                              <span className="text-sm text-gray-700">{val}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}

                    {(question.type || "mcq") === "short" && (
                      <div>
                        <label className="block text-sm font-semibold text-gray-700">
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
                  </div>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  No quiz questions yet. Add your first question below!
                </p>
              </div>
            )}
          </div>

          {/* Add Question Button */}
          <Button
            onClick={addQuizQuestion}
            className="w-full gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Add Quiz Question
          </Button>
        </div>
      )}
    </Card>
  )
}
