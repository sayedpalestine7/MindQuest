import React from "react"
import { Clapperboard, Bot, Sparkles, MessageSquare, Brain, Trophy, Target, Zap, CheckCircle } from "lucide-react"

const features = [
  {
    icon: <Clapperboard className="w-6 h-6 text-yellow-600" />,
    title: "Animation Studio",
    desc: "Create professional algorithm visualizations with our built-in timeline editor. No external tools needed.",
    gradient: "from-yellow-100 to-yellow-50",
    highlight: false
  },
  {
    icon: <Bot className="w-6 h-6 text-blue-600" />,
    title: "AI Quiz Generation",
    desc: "Generate smart quizzes automatically using AI. Save time and create better assessments.",
    gradient: "from-blue-100 to-blue-50",
    highlight: false
  },
  {
    icon: <MessageSquare className="w-6 h-6 text-orange-600" />,
    title: "Real-Time Chat",
    desc: "Connect with teachers instantly through built-in messaging. Get help when you need it.",
    gradient: "from-orange-100 to-orange-50",
    highlight: false
  },
  {
    icon: <CheckCircle className="w-6 h-6 text-purple-600" />,
    title: "Quality Assurance",
    desc: "All courses are reviewed and approved by admins to ensure high-quality content.",
    gradient: "from-purple-100 to-purple-50",
    highlight: false
  },
  {
    icon: <Trophy className="w-6 h-6 text-pink-600" />,
    title: "Gamification",
    desc: "Earn points, track progress, and stay motivated with achievements and leaderboards.",
    gradient: "from-pink-100 to-pink-50",
    highlight: false
  },
  {
    icon: <Target className="w-6 h-6 text-green-600" />,
    title: "Progress Tracking",
    desc: "Monitor your learning journey with detailed analytics and personalized insights.",
    gradient: "from-green-100 to-green-50",
    highlight: false
  },
]

export default function Features() {
  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Why Choose MindQuest?</h2>
        <p className="text-gray-600 mb-12">Features that set us apart from other learning platforms</p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div 
              key={i} 
              className={`p-6 bg-gradient-to-br ${f.gradient} rounded-xl transition transform hover:scale-105 ${
                f.highlight ? 'shadow-xl' : 'border-2 border-gray-100 bg-white shadow-sm'
              }`}
            >
              <div className={`w-12 h-12 flex items-center justify-center rounded-xl mb-4 ${
                f.highlight ? 'bg-white/20' : 'bg-gradient-to-br ' + f.gradient
              }`}>
                {f.icon}
              </div>
              <h3 className={`text-xl font-semibold mb-2 ${
                f.highlight ? 'text-white' : 'text-gray-900'
              }`}>{f.title}</h3>
              <p className={f.highlight ? 'text-white/90' : 'text-gray-600'}>{f.desc}</p>
              {f.highlight && (
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-white/80 bg-white/20 px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3" /> Unique Feature
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
