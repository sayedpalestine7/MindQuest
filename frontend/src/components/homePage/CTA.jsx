import React from "react"
import { ArrowRight } from "lucide-react"

export default function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8 text-center">
        <div className="p-12 rounded-2xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Learning?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of students mastering technical concepts through interactive learning.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </button>
            <button className="px-8 py-3 border rounded-md hover:bg-gray-50">View All Courses</button>
          </div>
        </div>
      </div>
    </section>
  )
}
