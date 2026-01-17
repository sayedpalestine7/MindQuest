// /src/components/QuizModal.jsx
import React, { useState, useEffect, useRef } from "react"
import courseService from "../../services/courseService"
import toast from "react-hot-toast"
import { useNavigate } from "react-router"
import { X, Award, CheckCircle2, XCircle, RotateCcw, Clock, Pause, Play } from "lucide-react"
import { Card, Button } from "../courseBuilder/UI"

/* Simple confetti animation on canvas */
function useConfetti(trigger) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!trigger || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    const W = (canvas.width = window.innerWidth)
    const H = (canvas.height = window.innerHeight)
    const confetti = Array.from({ length: 150 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H - H,
      r: Math.random() * 6 + 2,
      dx: Math.random() * 4 - 2,
      dy: Math.random() * 3 + 3,
      color: `hsl(${Math.random() * 360}, 100%, 70%)`,
    }))

    let frame
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      confetti.forEach((p) => {
        p.y += p.dy
        p.x += p.dx
        if (p.y > H) p.y = -10
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI)
        ctx.fillStyle = p.color
        ctx.fill()
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [trigger])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-40" />
}

export default function QuizModal({ quiz, onClose, courseId, previewMode = false }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState(false)
  const [quizMarked, setQuizMarked] = useState(false)
  const [questionResults, setQuestionResults] = useState([])
  const [isPaused, setIsPaused] = useState(false)
  const [timeLeft, setTimeLeft] = useState(null)
  const [shuffledQuestions, setShuffledQuestions] = useState([])
  const [reviewFilter, setReviewFilter] = useState("all") // "all", "correct", "incorrect"
  const timerRef = useRef(null)
  const navigate = useNavigate()
  const confettiCanvas = useConfetti(confetti)

  // Allow the modal to mount even if `quiz.questions` is empty so we can
  // attempt to fetch/populate questions or show a helpful message.
  if (!quiz) return null

  // Initialize: load saved progress or create new session
  useEffect(() => {
    const init = async () => {
      // In preview mode, never read saved progress or call backend; use provided quiz data only
      if (previewMode) {
        const providedQuestions = quiz.questions || []
        if (providedQuestions.length > 0) {
          const questions = providedQuestions.map((q, idx) => ({ ...q, originalIndex: idx }))
          const shuffled = questions.sort(() => Math.random() - 0.5)
          setShuffledQuestions(shuffled)
        }
        const timeLimit = quiz.timeLimit || null
        if (timeLimit) setTimeLeft(timeLimit * 60)
        return
      }

      const savedProgress = courseId ? localStorage.getItem(`quiz-progress-${courseId}`) : null

      if (savedProgress) {
        const { currentQuestion: q, answers: a, shuffled, timeLeft: t } = JSON.parse(savedProgress)
        setCurrentQuestion(q)
        setAnswers(a)
        setShuffledQuestions(shuffled)
        setTimeLeft(t)
        return
      }

      // If quiz provides questions, use them. Otherwise attempt to fetch quizzes for the course.
      const providedQuestions = quiz.questions || []
      if (providedQuestions.length > 0) {
        const questions = providedQuestions.map((q, idx) => ({ ...q, originalIndex: idx }))
        const shuffled = questions.sort(() => Math.random() - 0.5)
        setShuffledQuestions(shuffled)
      } else if (courseId) {
        try {
          const qRes = await courseService.getQuizzesByCourse(courseId)
          if (qRes.success && Array.isArray(qRes.data)) {
            const found = qRes.data.find((x) => String(x._id) === String(quiz._id)) || qRes.data[0]
            if (found && Array.isArray(found.questionIds) && found.questionIds.length > 0) {
              const mapped = found.questionIds.map((q, idx) => ({
                id: q._id || q.id,
                type: q.type || 'mcq',
                question: q.text || q.question || '',
                options: Array.isArray(q.options) ? q.options : [],
                correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
                correctAnswer: q.correctAnswer || '',
                points: q.points || 1,
                explanation: q.explanation || '',
                originalIndex: idx,
              }))
              const shuffled = mapped.sort(() => Math.random() - 0.5)
              setShuffledQuestions(shuffled)
            }
          }
        } catch (e) {
          console.error("QuizModal: failed to fetch quizzes for course", e)
        }
      }

      // Set timer if quiz has time limit (e.g., 1 minute per question)
      const timeLimit = quiz.timeLimit || null
      if (timeLimit) {
        setTimeLeft(timeLimit * 60)
      }
    }

    init()
  }, [quiz, courseId])

  // Timer effect
  useEffect(() => {
    if (!timeLeft || isPaused || showResults) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleSubmitQuiz()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timerRef.current)
  }, [timeLeft, isPaused, showResults])

  const total = shuffledQuestions.length || (quiz?.questions?.length || 0)
  const currentQuiz = shuffledQuestions.length > 0 ? shuffledQuestions[currentQuestion] : (quiz?.questions?.[currentQuestion] || null)
  const isAnswered = answers[currentQuestion] !== undefined

  // Handle answer for all question types
  const handleAnswer = (answer) => {
    setAnswers({ ...answers, [currentQuestion]: answer })
  }

  // Check if answer is correct based on question type
  const isAnswerCorrect = (question, answer) => {
    if (!question) return false

    const type = question.type || "mcq"

    if (type === "mcq") {
      return answer === question.correctAnswerIndex
    } else if (type === "tf") {
      return answer === question.correctAnswer
    } else if (type === "short") {
      const userAnswer = String(answer || "").toLowerCase().trim()
      const correctAnswer = String(question.correctAnswer || "").toLowerCase().trim()
      return userAnswer === correctAnswer
    }
    return false
  }

  const handleSubmitQuiz = () => {
    let correct = 0
    const questions = shuffledQuestions.length > 0 ? shuffledQuestions : quiz.questions
    const results = questions.map((q, i) => {
      const isCorrect = isAnswerCorrect(q, answers[i])
      if (isCorrect) correct++
      return {
        questionIndex: i,
        question: q.question,
        type: q.type || "mcq",
        userAnswer: answers[i],
        correctAnswer: q.correctAnswer || q.options?.[q.correctAnswerIndex],
        isCorrect,
      }
    })

    const percent = Math.round((correct / total) * 100)
    setScore(percent)
    setQuestionResults(results)
    setShowResults(true)
    if (percent >= (quiz.passingScore || 70)) setConfetti(true)
    
    // Clear saved progress and notify backend only in student mode
    if (!previewMode) {
      if (courseId) {
        localStorage.removeItem(`quiz-progress-${courseId}`)
      }
      ;(async () => {
        try {
          const studentId = localStorage.getItem("userId")
          if (studentId && courseId) {
            const resp = await courseService.markQuizCompleted(studentId, courseId, correct, total)
            if (resp.success) {
              setQuizMarked(true)
              toast.success("Quiz progress saved")
            } else {
              toast.error(resp.error || "Failed saving quiz progress")
            }
          }
        } catch (err) {
          console.error("Failed to mark quiz complete:", err)
        }
      })()
    }
  }

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setScore(0)
    setConfetti(false)
    setQuestionResults([])
    if (!previewMode && courseId) {
      localStorage.removeItem(`quiz-progress-${courseId}`)
    }
    // Reshuffle questions
    const questions = quiz.questions.map((q, idx) => ({ ...q, originalIndex: idx }))
    const shuffled = questions.sort(() => Math.random() - 0.5)
    setShuffledQuestions(shuffled)
    if (quiz.timeLimit) {
      setTimeLeft(quiz.timeLimit * 60)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showResults || isPaused) return

      if (e.key === "ArrowRight" && isAnswered && currentQuestion < total - 1) {
        setCurrentQuestion((prev) => prev + 1)
      } else if (e.key === "ArrowLeft" && currentQuestion > 0) {
        setCurrentQuestion((prev) => prev - 1)
      } else if (e.key === " ") {
        e.preventDefault()
        if (isAnswered) handleNext()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestion, isAnswered, total, showResults, isPaused, handleNext])

  useEffect(() => {
    if (previewMode) return
    if (!showResults && courseId) {
      const progress = {
        currentQuestion,
        answers,
        shuffled: shuffledQuestions,
        timeLeft,
      }
      localStorage.setItem(`quiz-progress-${courseId}`, JSON.stringify(progress))
    }
  }, [currentQuestion, answers, shuffledQuestions, timeLeft, showResults, courseId])


  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="relative bg-white rounded-2xl shadow-2xl border-2 border-gray-300 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-zoomIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-300 bg-gradient-to-r from-yellow-50 to-orange-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Final Quiz
          </h2>
          <div className="flex items-center gap-4">
            {timeLeft !== null && !showResults && (
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                timeLeft < 60 ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
              }`}>
                <Clock className="w-4 h-4" />
                <span className="font-mono font-semibold text-sm">{formatTime(timeLeft)}</span>
              </div>
            )}
            {!showResults && (
              <Button
                onClick={() => setIsPaused(!isPaused)}
                variant="ghost"
                size="sm"
                className="h-10 w-10 p-0 hover:bg-yellow-50"
              >
                {isPaused ? (
                  <Play className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Pause className="w-5 h-5 text-yellow-600" />
                )}
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="h-10 w-10 p-0 hover:bg-red-50"
            >
              <X className="w-5 h-5 text-red-500" />
            </Button>
          </div>
        </div>

          <div className="p-8 overflow-y-auto max-h-[calc(90vh-88px)] relative">
          {/* Confetti Canvas */}
          {confetti && confettiCanvas}

          {/* Pause Overlay */}
          {isPaused && !showResults && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center z-50 rounded-xl">
              <Pause className="w-16 h-16 text-white mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Quiz Paused</h3>
              <p className="text-gray-200 mb-6">Your progress is being saved automatically</p>
              <Button
                onClick={() => setIsPaused(false)}
                className="bg-yellow-600 hover:bg-yellow-700 text-white gap-2"
              >
                <Play className="w-4 h-4" />
                Resume Quiz
              </Button>
            </div>
          )}

          {!showResults ? (
            <div className="space-y-6" style={{ opacity: isPaused ? 0.5 : 1, pointerEvents: isPaused ? "none" : "auto" }}>
              {shuffledQuestions.length === 0 && (!quiz?.questions || quiz.questions.length === 0) && (
                <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg text-center">
                  <p className="text-sm text-yellow-800 mb-3">No questions are available for this quiz.</p>
                  <p className="text-xs text-gray-500 mb-4">If this looks wrong, try refreshing the quiz data.</p>
                  <div className="flex justify-center gap-2">
                    <Button
                      onClick={async () => {
                        if (previewMode) {
                          toast("Preview mode: questions are embedded and cannot be refreshed")
                          return
                        }
                        try {
                          const qRes = await courseService.getQuizzesByCourse(courseId)
                          if (qRes.success && Array.isArray(qRes.data) && qRes.data.length > 0) {
                            const found = qRes.data.find((x) => String(x._id) === String(quiz._id)) || qRes.data[0]
                            if (found && Array.isArray(found.questionIds) && found.questionIds.length > 0) {
                              const mapped = found.questionIds.map((q, idx) => ({
                                id: q._id || q.id,
                                type: q.type || 'mcq',
                                question: q.text || q.question || '',
                                options: Array.isArray(q.options) ? q.options : [],
                                correctAnswerIndex: q.correctAnswerIndex !== undefined ? q.correctAnswerIndex : null,
                                correctAnswer: q.correctAnswer || '',
                                points: q.points || 1,
                                explanation: q.explanation || '',
                                originalIndex: idx,
                              }))
                              setShuffledQuestions(mapped.sort(() => Math.random() - 0.5))
                            }
                          }
                        } catch (e) {
                          console.error("QuizModal refresh failed:", e)
                        }
                      }}
                      className="bg-yellow-600 text-white"
                    >
                      Refresh Questions
                    </Button>
                    <Button onClick={onClose} variant="ghost">Close</Button>
                  </div>
                </div>
              )}
              {/* Question progress */}
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Question {currentQuestion + 1} of {total}
                </p>
                <p className="text-xs text-gray-400">
                  Type: <span className="font-semibold capitalize">{currentQuiz?.type || "mcq"}</span>
                </p>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-600 to-orange-600 transition-all duration-300"
                  style={{ width: `${((currentQuestion + 1) / total) * 100}%` }}
                />
              </div>

              {/* Question Navigator */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">Jump to:</span>
                  {Array.from({ length: total }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentQuestion(idx)}
                      className={`flex-shrink-0 w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                        idx === currentQuestion
                          ? "bg-yellow-600 text-white ring-2 ring-yellow-300"
                          : answers[idx] !== undefined
                          ? "bg-green-200 text-green-800 hover:bg-green-300"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  💡 Tip: Use ← → arrow keys to navigate, Space to continue, or click numbers above
                </p>
              </div>

              <Card className="p-6 border-2 border-gray-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  {currentQuiz?.question}
                </h3>

                {/* MCQ Type */}
                {(currentQuiz?.type || "mcq") === "mcq" && (
                  <div className="space-y-3">
                    {(currentQuiz?.options || []).map((opt, idx) => (
                      <label
                        key={idx}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[currentQuestion] === idx
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-300 hover:border-yellow-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion}`}
                          checked={answers[currentQuestion] === idx}
                          onChange={() => handleAnswer(idx)}
                          className="w-4 h-4 accent-yellow-600"
                        />
                        <span className="text-gray-900">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* True/False Type */}
                {currentQuiz?.type === "tf" && (
                  <div className="space-y-3">
                    {["True", "False"].map((val) => (
                      <label
                        key={val}
                        className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          answers[currentQuestion] === val
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-300 hover:border-yellow-400"
                        }`}
                      >
                        <input
                          type="radio"
                          name={`q-${currentQuestion}`}
                          checked={answers[currentQuestion] === val}
                          onChange={() => handleAnswer(val)}
                          className="w-4 h-4 accent-yellow-600"
                        />
                        <span className="text-gray-900 font-medium">{val}</span>
                      </label>
                    ))}
                  </div>
                )}

                {/* Short Answer Type */}
                {currentQuiz?.type === "short" && (
                  <div className="space-y-3">
                    <textarea
                      value={answers[currentQuestion] || ""}
                      onChange={(e) => handleAnswer(e.target.value)}
                      placeholder="Type your answer here..."
                      rows={4}
                      className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:ring-2 focus:ring-yellow-200 resize-none"
                    />
                    <p className="text-xs text-gray-500">
                      Answer will be compared case-insensitively
                    </p>
                  </div>
                )}
              </Card>

              {/* Next / Submit Button */}
              <div className="text-right">
                <Button
                  onClick={handleNext}
                  disabled={!isAnswered}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {currentQuestion === total - 1 ? "Submit Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Results Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  {score >= (quiz.passingScore || 70) ? (
                    <CheckCircle2 className="w-16 h-16 text-green-600" />
                  ) : (
                    <XCircle className="w-16 h-16 text-red-600" />
                  )}
                </div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {score >= (quiz.passingScore || 70)
                    ? "Congratulations!"
                    : "Keep Practicing!"}
                </h3>
                <p className="text-gray-600 text-lg">
                  You scored{" "}
                  <span className="font-semibold text-gray-900">
                    {score}%
                  </span>{" "}
                  (Passing Score: {quiz.passingScore || 70}%)
                </p>
                <div className="pt-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{questionResults.filter(r => r.isCorrect).length}</span> of <span className="font-semibold">{total}</span> questions correct
                  </div>
                </div>
              </div>

              {/* Question Review */}
              <div className="space-y-4 pt-6 border-t border-gray-300">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold text-gray-900">Review Your Answers</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setReviewFilter("all")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        reviewFilter === "all"
                          ? "bg-yellow-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setReviewFilter("correct")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        reviewFilter === "correct"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ✓ Correct ({questionResults.filter(r => r.isCorrect).length})
                    </button>
                    <button
                      onClick={() => setReviewFilter("incorrect")}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                        reviewFilter === "incorrect"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      ✕ Incorrect ({questionResults.filter(r => !r.isCorrect).length})
                    </button>
                  </div>
                </div>
                {questionResults
                  .filter(
                    (result) =>
                      reviewFilter === "all" ||
                      (reviewFilter === "correct" && result.isCorrect) ||
                      (reviewFilter === "incorrect" && !result.isCorrect)
                  )
                  .map((result, idx) => (
                    <Card
                      key={idx}
                      className={`p-4 border-2 ${
                        result.isCorrect ? "border-green-300 bg-green-50" : "border-red-300 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 pt-1">
                          {result.isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="font-semibold text-gray-900">
                              Question {result.questionIndex + 1}
                              <span className="ml-2 text-xs font-normal text-gray-500 capitalize">
                                ({result.type})
                              </span>
                            </h5>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{result.question}</p>

                          {/* Show answer details based on type */}
                          <div className="mt-3 space-y-2 text-sm">
                            <div>
                              <p className="text-gray-600">
                                <span className="font-semibold">Your answer:</span>{" "}
                                <span className="text-gray-900">{String(result.userAnswer || "Not answered")}</span>
                              </p>
                            </div>
                            {!result.isCorrect && (
                              <div>
                                <p className="text-gray-600">
                                  <span className="font-semibold">Correct answer:</span>{" "}
                                  <span className="text-green-700">{String(result.correctAnswer)}</span>
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-center gap-3 pt-6 border-t border-gray-300">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </Button>
                {score >= (quiz.passingScore || 70) ? (
                  <>
                    <Button
                      onClick={async () => {
                        try {
                          if (!previewMode) {
                            const studentId = localStorage.getItem("userId")
                            if (studentId && courseId && !quizMarked) {
                              await courseService.markQuizCompleted(studentId, courseId, Math.round((questionResults.filter(r => r.isCorrect).length)), total)
                            }
                          }
                        } catch (err) {
                          console.error(err)
                        }
                        toast.success("Course completed! Redirecting...")
                        onClose()
                        if (!previewMode) {
                          const sid = localStorage.getItem("userId")
                          if (sid) navigate(`/student/${sid}`)
                        }
                      }}
                      className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Finish Course
                    </Button>
                    <Button
                      onClick={onClose}
                      variant="ghost"
                      className="gap-2"
                    >
                      Close
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={onClose}
                    className="gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white"
                  >
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* --- Animations --- */
const style = document.createElement("style")
style.innerHTML = `
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out; }
.animate-zoomIn { animation: zoomIn 0.25s ease-out; }
`
document.head.appendChild(style)
