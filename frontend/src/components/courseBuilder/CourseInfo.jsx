// /src/components/CourseInfo.jsx
import React from "react"
import { BookOpen, Upload } from "lucide-react"
import { Input, Textarea, Select, Button, Card } from "./UI"

export default function CourseInfo({ course, setCourse, handleImageUpload }) {
  return (
    <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-white" />
        </div>
        Course Information
      </h2>

      <div className="space-y-4">
        {/* Course Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700  mb-2">
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
            rows={3}
            className="border-2 border-gray-300 resize-none"
          />
        </div>

        {/* Difficulty + Thumbnail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Thumbnail
            </label>
            <div className="flex gap-2 items-center">
              <Input
                value={course.thumbnail}
                onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                placeholder="Enter URL or upload..."
                className="border-2 border-gray-300 flex-1"
              />

              {/* File Upload */}
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

            {/* Thumbnail Preview */}
            {course.thumbnail && (
              <img
                src={course.thumbnail || "/placeholder.svg"}
                alt="Thumbnail preview"
                className="mt-2 w-full h-32 object-cover rounded-lg border-2 border-gray-300"
              />
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
