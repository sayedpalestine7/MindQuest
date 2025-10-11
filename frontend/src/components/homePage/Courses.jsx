import React from "react"
import { Brain, Zap, Gamepad2, CheckCircle2, ArrowRight } from "lucide-react"

const courses = [
  {
    title: "Data Structures",
    lessons: 20,
    icon: <Brain className="w-12 h-12 text-blue-600" />,
    color: "from-blue-100 to-blue-50",
    desc: "Master arrays, linked lists, stacks, queues, trees, and graphs with visualizations.",
  },
  {
    title: "Algorithms",
    lessons: 18,
    icon: <Zap className="w-12 h-12 text-purple-600" />,
    color: "from-purple-100 to-purple-50",
    desc: "Learn sorting, searching, and optimization algorithms through step-by-step animations.",
  },
  {
    title: "Programming Fundamentals",
    lessons: 15,
    icon: <Gamepad2 className="w-12 h-12 text-pink-600" />,
    color: "from-pink-100 to-pink-50",
    desc: "Build a solid foundation with core programming concepts and best practices.",
  },
]

export default function Courses() {
  return (
    <section id="courses" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Start Your Journey</h2>
        <p className="text-gray-600 mb-12">Explore our most popular courses</p>
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {courses.map((c, i) => (
            <div key={i} className="border-2 p-6 rounded-xl hover:shadow-lg bg-white transition">
              <div
                className={`aspect-video bg-gradient-to-br ${c.color} rounded-lg mb-4 flex items-center justify-center`}
              >
                {c.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{c.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{c.desc}</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  <span>{c.lessons} Lessons</span>
                </div>
                <button className="text-blue-600 flex items-center gap-1">
                  Explore <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
