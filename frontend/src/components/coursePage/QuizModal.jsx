// /src/components/QuizModal.jsx
import React, { useState, useEffect, useRef } from "react"
import { X, Award, CheckCircle2, XCircle, RotateCcw } from "lucide-react"
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

export default function QuizModal({ quiz, onClose }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)
  const [confetti, setConfetti] = useState(false)

  if (!quiz) return null
  const total = quiz.questions.length

  const handleAnswer = (index) => {
    setAnswers({ ...answers, [currentQuestion]: index })
  }

  const handleNext = () => {
    if (currentQuestion < total - 1) {
      setCurrentQuestion((prev) => prev + 1)
    } else {
      // Submit quiz
      let correct = 0
      quiz.questions.forEach((q, i) => {
        if (answers[i] === q.correctAnswerIndex) correct++
      })
      const percent = Math.round((correct / total) * 100)
      setScore(percent)
      setShowResults(true)
      if (percent >= quiz.passingScore) setConfetti(true)
    }
  }

  const handleRestart = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setScore(0)
    setConfetti(false)
  }

  const current = quiz.questions[currentQuestion]

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-2 border-gray-300 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden animate-zoomIn">
        <div className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-700 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Final Quiz
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-10 w-10 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <X className="w-5 h-5 text-red-500" />
          </Button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[calc(90vh-88px)]">
          {/* Confetti Canvas */}
          {confetti && useConfetti(true)}

          {!showResults ? (
            <div className="space-y-6">
              {/* Question progress */}
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                Question {currentQuestion + 1} of {total}
              </p>

              <Card className="p-6 border-2 border-gray-300 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {current.question}
                </h3>

                <div className="space-y-3">
                  {current.options.map((opt, idx) => (
                    <label
                      key={idx}
                      className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQuestion] === idx
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-blue-400"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQuestion}`}
                        checked={answers[currentQuestion] === idx}
                        onChange={() => handleAnswer(idx)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-gray-900 dark:text-gray-100">{opt}</span>
                    </label>
                  ))}
                </div>
              </Card>

              {/* Next / Submit Button */}
              <div className="text-right">
                <Button
                  onClick={handleNext}
                  disabled={answers[currentQuestion] === undefined}
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white gap-2"
                >
                  {currentQuestion === total - 1 ? "Submit Quiz" : "Next Question"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {score >= quiz.passingScore ? (
                  <CheckCircle2 className="w-16 h-16 text-green-600" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-600" />
                )}
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {score >= quiz.passingScore
                  ? "Congratulations!"
                  : "Keep Practicing!"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                You scored{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  {score}%
                </span>{" "}
                (Passing Score: {quiz.passingScore}%)
              </p>

              <div className="flex justify-center gap-3">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Retry
                </Button>
                <Button
                  onClick={onClose}
                  className="gap-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-white"
                >
                  Close
                </Button>
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
