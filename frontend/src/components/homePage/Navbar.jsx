import React from "react"
import { Brain } from "lucide-react"
import { Link } from "react-router"

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-800">MindQuest</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-500 hover:text-gray-800">
              Features
            </a>
            <a href="#courses" className="text-sm font-medium text-gray-500 hover:text-gray-800">
              Courses
            </a>
            <a href="#how-it-works" className="text-sm font-medium text-gray-500 hover:text-gray-800">
              How It Works
            </a>
          </div>
          <div className="flex items-center gap-3">
            {/* when user press the Sign In button go to the signin page */}
            <button className="text-sm font-medium px-4 py-2 rounded-md hover:bg-gray-100" >
              <Link to="/login">Sign In</Link>
            </button>
            <button className="text-sm font-medium px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Link to="/signup">Get Started</Link>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
