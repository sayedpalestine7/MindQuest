import React from "react"
import { Sparkles, Gamepad2, Brain, Trophy, Target, Zap } from "lucide-react"

const features = [
  {
    icon: <Sparkles className="w-6 h-6 text-blue-600" />,
    title: "Visual Animations",
    desc: "Watch concepts come to life with interactive animations that demonstrate algorithms in real-time.",
  },
  {
    icon: <Gamepad2 className="w-6 h-6 text-purple-600" />,
    title: "Interactive Simulations",
    desc: "Practice with mini-games that let you manipulate data structures and see instant results.",
  },
  {
    icon: <Brain className="w-6 h-6 text-pink-600" />,
    title: "Smart Quizzes",
    desc: "Test your understanding with quizzes after each lesson and track your progress.",
  },
  {
    icon: <Trophy className="w-6 h-6 text-blue-600" />,
    title: "Achievements",
    desc: "Earn points, unlock achievements, and track your journey with gamified progress.",
  },
  {
    icon: <Target className="w-6 h-6 text-purple-600" />,
    title: "Progress Tracking",
    desc: "Monitor your learning progress with analytics and recommendations.",
  },
  {
    icon: <Zap className="w-6 h-6 text-pink-600" />,
    title: "Structured Courses",
    desc: "Follow carefully crafted course paths from fundamentals to advanced topics.",
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Learning That Sticks</h2>
        <p className="text-gray-600 mb-12">Experience a new way of learning that combines visualization and fun</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 bg-white border-2 rounded-xl hover:border-blue-400 transition">
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-50 mb-4">{f.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
