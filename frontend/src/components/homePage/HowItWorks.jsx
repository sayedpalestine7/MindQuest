import React from "react"

const steps = [
  { num: 1, title: "Choose a Course", color: "text-blue-600", desc: "Select from our curated courses." },
  { num: 2, title: "Watch & Learn", color: "text-purple-600", desc: "Engage with interactive explanations." },
  { num: 3, title: "Practice", color: "text-pink-600", desc: "Apply your knowledge with simulations." },
  { num: 4, title: "Master It", color: "text-blue-600", desc: "Test your understanding with quizzes." },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Your Learning Journey</h2>
        <p className="text-gray-600 mb-12">Four simple steps to master complex concepts</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((s, i) => (
            <div key={i}>
              <div
                className={`w-16 h-16 flex items-center justify-center mx-auto mb-4 rounded-2xl border-2 ${s.color} border-gray-300`}
              >
                <span className={`text-2xl font-bold ${s.color}`}>{s.num}</span>
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
