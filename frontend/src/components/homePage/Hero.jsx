import React from "react"
import { Sparkles, Play, ArrowRight } from "lucide-react"

export default function Hero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />
      <div className="relative z-10 container mx-auto px-4 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1 text-blue-600 font-medium mb-6">
            <Sparkles className="w-4 h-4" /> Interactive Learning Platform
          </span>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            Learn Through
            <span className="block text-blue-600 mt-2">Interactive Experience</span>
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Master Data Structures, Algorithms, and Programming Fundamentals with visual animations and gamified
            learning that makes complex concepts simple.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Start Learning Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center gap-2 px-8 py-3 border rounded-md hover:bg-gray-50">
              <Play className="w-4 h-4" /> Watch Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
