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
          {/* <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-md">
            <BookOpen className="w-5 h-5 text-white" />
          </div> */}
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
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Section - Thumbnail */}
            <div className="lg:min-w-96 flex-shrink-0">
              <div className="space-y-4">
                {/* Thumbnail Preview */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course Thumbnail
                  </label>
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt="Thumbnail preview"
                      className="h-48 w-96 object-cover rounded-lg border-2 border-gray-300 shadow-sm hover:shadow-md transition-shadow"
                    />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-gray-400 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload Controls */}
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      value={course.thumbnail}
                      onChange={(e) => setCourse({ ...course, thumbnail: e.target.value })}
                      placeholder="Image URL..."
                      className="border-2 border-gray-300 flex-1 text-xs h-9"
                    />
                    <label className="cursor-pointer flex-shrink-0">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 border-2 bg-white hover:bg-gray-50 h-9 px-3"
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
            </div>

            {/* Right Section - Form Fields */}
            <div className="flex-1 space-y-4">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={course.title}
                  onChange={(e) => setCourse({ ...course, title: e.target.value })}
                  placeholder="e.g., Introduction to Web Development"
                  className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Describe what students will learn in this course..."
                  rows={4}
                  className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {course.description?.length || 0} characters
                </p>
              </div>

              {/* Category and Difficulty - Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={course.category || "General"}
                    onChange={(e) => setCourse({ ...course, category: e.target.value })}
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="General">General</option>
                    <option value="Programming">Programming</option>
                    <option value="Web Development">Web Development</option>
                    <option value="Data Science">Data Science</option>
                    <option value="Computer Science">Computer Science</option>
                    <option value="Design">Design</option>
                    <option value="Backend">Backend</option>
                    <option value="Mobile Development">Mobile Development</option>
                    <option value="Data Structures">Data Structures</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Cyber Security">Cyber Security</option>
                    <option value="Other">Other</option>
                  </Select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Difficulty Level <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={course.difficulty}
                    onChange={(e) => setCourse({ ...course, difficulty: e.target.value })}
                    className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </Select>
                </div>
              </div>

              {/* Pricing Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Pricing <span className="text-red-500">*</span>
                </label>
                <div className="space-y-3">
                  {/* Free/Paid Radio Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pricing"
                        value="free"
                        checked={Number(course.price) === 0}
                        onChange={() => setCourse({ ...course, price: 0 })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Free</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="pricing"
                        value="paid"
                        checked={Number(course.price) > 0}
                        onChange={() => setCourse({ ...course, price: course.price > 0 ? course.price : 1 })}
                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Paid</span>
                    </label>
                  </div>

                  {/* Price Input - Only shown when Paid is selected */}
                  {Number(course.price) > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-gray-700">$</span>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={course.price}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCourse({ ...course, price: val >= 0 ? val : 0 });
                        }}
                        placeholder="29"
                        className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all w-32"
                      />
                      <span className="text-sm text-gray-500">USD</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {Number(course.price) === 0
                      ? "This course will be free for all students"
                      : `Students will pay $${Number(course.price)} to enroll`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
