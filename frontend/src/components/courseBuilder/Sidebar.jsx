// /src/components/Sidebar.jsx
import React from "react"
import { Plus, Trash2, GripVertical, Eye, EyeOff } from "lucide-react"
import { Button, Input } from "./UI"
import { motion } from "framer-motion"

export default function Sidebar({
  lessons,
  selectedLessonId,
  setSelectedLessonId,
  addLesson,
  deleteLesson,
  updateLessonTitle,
  updateLessonPreview,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  draggedLessonId,
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Add Lesson Button */}
      <div className="mb-4">
        <Button
          size="sm"
          onClick={addLesson}
          className="w-full gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons List - Vertical Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, lesson.id)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group/item p-3 rounded-lg border-2 transition-all cursor-pointer ${selectedLessonId === lesson.id
                ? "bg-blue-50 border-blue-300 shadow-md"
                : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
                } ${draggedLessonId === lesson.id ? "opacity-40" : ""
                }`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <div className="flex items-start gap-2">
                {/* Drag handle */}
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, lesson.id)}
                  onDragEnd={handleDragEnd}
                  className="pt-1 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition flex-shrink-0"
                >
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Lesson number and content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-xs font-semibold text-gray-500">
                      Lesson {index + 1}
                    </div>
                    {lesson.isPreview && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                        Preview
                      </span>
                    )}
                  </div>
                  <Input
                    value={lesson.title}
                    onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
                    onBlur={() => {
                      if (!lesson.title.trim()) {
                        updateLessonTitle(lesson.id, `Lesson ${index + 1}`)
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 border-0 bg-transparent focus:ring-1 text-sm font-semibold text-gray-800 placeholder-gray-400 w-full truncate"
                    placeholder="Untitled lesson"
                  />
                </div>

                {/* Preview toggle button */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    if (updateLessonPreview) {
                      updateLessonPreview(lesson.id, !lesson.isPreview)
                    }
                  }}
                  className={`opacity-0 group-hover/item:opacity-100 transition-opacity h-7 w-7 p-0 flex-shrink-0 ${
                    lesson.isPreview 
                      ? 'bg-green-50 hover:bg-green-100 opacity-100' 
                      : 'hover:bg-gray-100'
                  }`}
                  title={lesson.isPreview ? "Remove preview access" : "Make this lesson free to preview"}
                >
                  {lesson.isPreview ? (
                    <Eye className="w-4 h-4 text-green-600" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-500" />
                  )}
                </Button>

                {/* Delete button */}
                {lessons.length > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteLesson(lesson.id)
                    }}
                    className="opacity-0 group-hover/item:opacity-100 transition-opacity h-7 w-7 p-0 flex-shrink-0 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 text-red-500 hover:text-red-700" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer info */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-xs text-gray-600">
        <p className="flex items-center gap-1">
          <GripVertical className="w-3 h-3" />
          Drag to reorder lessons
        </p>
      </div>
    </div>
  )
}
