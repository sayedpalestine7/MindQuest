import React, { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

const faqs = [
  {
    question: "Is MindQuest really free?",
    answer: "Yes! MindQuest is completely free for students. You can enroll in unlimited courses, track your progress, and chat with teachers at no cost."
  },
  {
    question: "How does the Animation Studio work?",
    answer: "Our Animation Studio is a timeline-based editor that lets teachers create professional algorithm visualizations. It features keyframe animations, multiple object support, and various easing options. No external tools needed!"
  },
  {
    question: "Can I become a teacher on MindQuest?",
    answer: "Absolutely! Teachers can sign up, get verified by our admin team, and start creating courses. You'll have access to our Animation Studio, AI quiz generation, and real-time chat with students."
  },
  {
    question: "What makes MindQuest different from other platforms?",
    answer: "MindQuest is the only platform with a built-in Animation Studio for creating algorithm visualizations. We also offer AI-powered quiz generation, real-time teacher-student chat, and a course approval system ensuring quality content."
  },
  {
    question: "Do I get certificates after completing courses?",
    answer: "Yes! You earn completion certificates and points for each course you finish. Track your achievements and showcase your progress on your profile."
  },
  {
    question: "How does the teacher verification process work?",
    answer: "Teachers submit their credentials including institution, specialization, and certification documents. Our admin team reviews applications to ensure quality educators join the platform."
  },
  {
    question: "Can I chat with teachers?",
    answer: "Yes! Once you enroll in a course, you can message the teacher in real-time through our built-in chat system. Get help whenever you need it."
  },
  {
    question: "What topics are covered on MindQuest?",
    answer: "We focus on technical subjects like Data Structures, Algorithms, Programming Fundamentals, Web Development, Machine Learning, and more. All taught through interactive animations and visualizations."
  }
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-gray-600">Everything you need to know about MindQuest</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-400 transition"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left bg-white hover:bg-gray-50 transition"
              >
                <span className="font-semibold text-gray-900">{faq.question}</span>
                {openIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4 bg-gray-50">
                  <p className="text-gray-700">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Still have questions?</p>
          <a 
            href="mailto:support@mindquest.com" 
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact our support team →
          </a>
        </div>
      </div>
    </section>
  )
}
