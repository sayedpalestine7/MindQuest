// /src/components/CourseInfo.jsx
import React, { useState, useEffect } from "react"
import { BookOpen, Upload, ChevronDown, ChevronUp } from "lucide-react"
import { Input, Textarea, Select, Button, Card } from "./UI"

export default function CourseInfo({ course, setCourse, handleImageUpload }) {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("courseInfo-collapsed")
    return saved === "true"
  })

  useEffect(() => {
    localStorage.setItem("courseInfo-collapsed", isCollapsed)
  }, [isCollapsed])

  return (
    <Card className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
      {/* Header - Always Visible */}
      <div
        className="p-4 border-b-2 border-gray-200 flex items-center justify-between cursor-pointer hover:bg-blue-100 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Course Information</h2>
            {isCollapsed && course.title && (
              <p className="text-sm text-gray-600 truncate max-w-md">{course.title}</p>
            )}
          </div>
        </div>
        <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
          {isCollapsed ? (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Left Column - Thumbnail Preview */}
            <div className="col-span-1 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Thumbnail Preview
                </label>
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt="Thumbnail preview"
                    className="w-full h-40 object-cover rounded-lg border-2 border-gray-300 shadow-md"
                  />
                ) : (
                  <div className="w-full h-40 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-sm text-gray-500">No preview</span>
                  </div>
                )}
              </div>

              {/* Thumbnail Upload Section */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Upload Image
                </label>
                <div className="flex gap-2">
                  <Input
                    value={course.thumbnail}
                    onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                    placeholder="Enter URL..."
                    className="border-2 border-gray-300 flex-1 text-xs"
                  />
                  <label className="cursor-pointer">
                    <Button
                      type="button"
                      variant="outline"
                      className="gap-2 border-2 bg-transparent"
                      asChild
                    >
                      <span>
                        <Upload className="w-4 h-4 text-gray-600" />
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleImageUpload(file)
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Form Fields */}
            <div className="col-span-2 space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title
                </label>
                <Input
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="Enter course title..."
                  className="border-2 border-gray-300"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Describe your course..."
                  rows={4}
                  className="border-2 border-gray-300 resize-none"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Difficulty
                </label>
                <Select
                  value={course.difficulty}
                  onChange={(e) => setCourse({ ...course, difficulty: e.target.value })}
                  className="border-gray-300"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
