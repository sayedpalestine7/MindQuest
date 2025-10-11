import React from "react"
import { Brain } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 text-gray-600">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800">MindQuest</span>
            </div>
            <p className="text-sm">
              Interactive learning platform for mastering technical concepts through visualization and gamification.
            </p>
          </div>

          {["Courses", "Resources", "Company"].map((section) => (
            <div key={section}>
              <h4 className="font-bold mb-4">{section}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Data Structures
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Algorithms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Programming Fundamentals
                  </a>
                </li>
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm">
          © 2025 MindQuest. Built as a graduation project to revolutionize technical education.
        </div>
      </div>
    </footer>
  )
}
