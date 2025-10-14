import React, { useState } from "react"
import { Plus, Save, BookOpen, FileText, Image, Youtube, Gamepad2, ChevronRight } from "lucide-react"

export default function TeacherCourseBuilder() {
  const [lessons, setLessons] = useState([{ id: 1, title: "Lesson 1" }])
  const [selectedLesson, setSelectedLesson] = useState(1)
  const [courseInfo, setCourseInfo] = useState({
    title: "",
    description: "",
    difficulty: "beginner",
    thumbnail: "",
  })

  // Add a new lesson
  const addLesson = () => {
    const newLesson = { id: lessons.length + 1, title: `Lesson ${lessons.length + 1}` }
    setLessons([...lessons, newLesson])
    setSelectedLesson(newLesson.id)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r p-4 flex flex-col">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-600">
          <BookOpen className="w-5 h-5" /> Course Builder
        </h2>
        <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson.id)}
              className={`text-left p-3 rounded-md border ${
                selectedLesson === lesson.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              {lesson.title}
            </button>
          ))}
        </div>
        <button
          onClick={addLesson}
          className="mt-4 flex items-center justify-center gap-2 text-sm py-2 border rounded-md hover:bg-gray-100"
        >
          <Plus className="w-4 h-4" /> Add Lesson
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Course Info Section */}
        <section className="bg-white border-2 rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Course Info</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Enter course title..."
                value={courseInfo.title}
                onChange={(e) => setCourseInfo({ ...courseInfo, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <select
                className="w-full border rounded-md p-2"
                value={courseInfo.difficulty}
                onChange={(e) => setCourseInfo({ ...courseInfo, difficulty: e.target.value })}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                rows="3"
                className="w-full border rounded-md p-2"
                placeholder="Write a brief description..."
                value={courseInfo.description}
                onChange={(e) => setCourseInfo({ ...courseInfo, description: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Thumbnail (URL)</label>
              <input
                type="text"
                className="w-full border rounded-md p-2"
                placeholder="Paste image link..."
                value={courseInfo.thumbnail}
                onChange={(e) => setCourseInfo({ ...courseInfo, thumbnail: e.target.value })}
              />
            </div>
          </div>
          <button className="mt-6 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            <Save className="w-4 h-4" /> Save Course
          </button>
        </section>

        {/* Lesson Editor Section */}
        <section className="bg-white border-2 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" /> {lessons.find((l) => l.id === selectedLesson)?.title}
          </h2>
          <p className="text-gray-600 mb-4">Add different content blocks below:</p>
          <div className="flex flex-wrap gap-3 mb-6">
            {[
              { icon: <FileText className="w-5 h-5" />, label: "Paragraph" },
              { icon: <Image className="w-5 h-5" />, label: "Image" },
              { icon: <Youtube className="w-5 h-5" />, label: "YouTube" },
              { icon: <Gamepad2 className="w-5 h-5" />, label: "Mini-game" },
            ].map((block, i) => (
              <button
                key={i}
                className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 text-sm"
              >
                {block.icon} {block.label}
              </button>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Lesson Content</h3>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-gray-500 text-sm">No content blocks yet — add one above.</div>
          </div>
        </section>
      </main>
    </div>
  )
}
// This is a simplified course builder interface for teachers to create and manage courses.