import React from "react"
import { useNavigate } from "react-router"
import { ArrowRight } from "lucide-react"

export default function CTA() {
  const navigate = useNavigate()

  const handleGetStarted = () => {
    if (window.gtag) {
      window.gtag('event', 'get_started_click', {
        source: 'cta'
      })
    }
    navigate("/navigates")
  }

  const handleViewCourses = () => {
    if (window.gtag) {
      window.gtag('event', 'view_all_courses_click', {
        source: 'cta'
      })
    }
    navigate("/courses")
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-2 border-blue-200">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join our community of learners mastering algorithms and data structures through interactive animations.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleGetStarted}
              className="mq-btn-primary px-8 py-3"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button 
              onClick={handleViewCourses}
              className="mq-btn-outline px-8 py-3"
            >
              View All Courses
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
