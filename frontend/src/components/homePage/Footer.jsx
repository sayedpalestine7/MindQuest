import React from "react"
import { Link } from "react-router"
import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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
            <p className="text-sm mb-4">
              Interactive learning platform for mastering algorithms and data structures through professional visualizations.
            </p>
            <div className="flex items-center gap-3">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="mailto:support@mindquest.com"
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-800">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses" className="hover:text-gray-800 transition">
                  Browse Courses
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection('animation-showcase')} className="hover:text-gray-800 transition">
                  Animation Studio
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('how-it-works')} className="hover:text-gray-800 transition">
                  How It Works
                </button>
              </li>
              <li>
                <Link to="/navigates" className="hover:text-gray-800 transition">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-800">For Educators</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/teacher-signup" className="hover:text-gray-800 transition">
                  Become a Teacher
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-gray-800 transition">
                  Teacher Login
                </Link>
              </li>
              <li>
                <button onClick={() => scrollToSection('features')} className="hover:text-gray-800 transition">
                  Features
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('faq')} className="hover:text-gray-800 transition">
                  FAQ
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-gray-800">About</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-gray-800 transition">
                  About MindQuest
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-800 transition">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-gray-800 transition">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="mailto:support@mindquest.com" className="hover:text-gray-800 transition">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-12 pt-8 text-center text-sm">
          <p>© {new Date().getFullYear()} MindQuest. Built as a graduation project to revolutionize technical education.</p>
          <p className="mt-2 text-xs text-gray-500">
            Made with ❤️ for learners and educators worldwide
          </p>
        </div>
      </div>
    </footer>
  )
}
