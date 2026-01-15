import React from "react"
import { X, BookOpen, Users, Star, Award, Clock, Calendar } from "lucide-react"

export default function CourseDialog({ course, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-4 pr-8" style={{ color: '#3F51B5' }}>
          {course.title}
        </h2>
        
        <img 
          src={course.thumbnail || "/placeholder.svg"} 
          alt={course.title} 
          className="w-full h-64 object-cover rounded-lg mb-4 shadow-md" 
        />
        
        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          {course.description}
        </p>
        
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Users className="w-6 h-6" style={{ color: '#3F51B5' }} />
            <div>
              <p className="text-sm text-gray-500">Students Enrolled</p>
              <p className="text-xl font-bold" style={{ color: '#263238' }}>
                {course.studentsEnrolled}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <BookOpen className="w-6 h-6" style={{ color: '#26A69A' }} />
            <div>
              <p className="text-sm text-gray-500">Lessons</p>
              <p className="text-xl font-bold" style={{ color: '#263238' }}>
                {course.lessonsCount || 0}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Star className="w-6 h-6" style={{ color: '#F9A825' }} />
            <div>
              <p className="text-sm text-gray-500">Rating</p>
              <p className="text-xl font-bold" style={{ color: '#263238' }}>
                {course.rating ? `${course.rating}/5` : 'N/A'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <Clock className="w-6 h-6" style={{ color: '#607D8B' }} />
            <div>
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-xl font-bold" style={{ color: '#263238' }}>
                {course.duration}
              </p>
            </div>
          </div>
        </div>
        
        <div className="space-y-3 border-t pt-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Teacher:</span>
            <span className="text-gray-600">{course.teacher.name}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Category:</span>
            <span className="px-3 py-1 rounded-full text-sm font-medium" style={{ 
              backgroundColor: '#E8EAF6', 
              color: '#3F51B5' 
            }}>
              {course.category}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Difficulty:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              course.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
              course.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {course.difficulty}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-700">Status:</span>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              course.status === 'published' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-gray-100 text-gray-700'
            }`}>
              {course.status === 'published' ? '✓ Published' : 'Draft'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <span className="font-semibold text-gray-700">Created:</span>
            <span className="text-gray-600">
              {new Date(course.createdAt).toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
