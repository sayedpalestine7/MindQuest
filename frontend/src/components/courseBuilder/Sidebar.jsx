// /src/components/Sidebar.jsx
import React from "react"
import { Plus, Trash2, GripVertical, BookMarked } from "lucide-react"
import { Button, Input } from "./UI"
import { motion } from "framer-motion"

export default function Sidebar({
  lessons,
  selectedLessonId,
  setSelectedLessonId,
  addLesson,
  deleteLesson,
  updateLessonTitle,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  draggedLessonId,
}) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden flex flex-col h-full shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-sm font-bold text-white">Lessons</h2>
            <p className="text-xs text-blue-100">{lessons.length} total</p>
          </div>
        </div>
      </div>

      {/* Add Lesson Button */}
      <div className="p-3 border-b border-gray-100">
        <Button
          size="sm"
          onClick={addLesson}
          className="w-full gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Lesson
        </Button>
      </div>

      {/* Lessons List - Vertical Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-3 space-y-2">
          {lessons.map((lesson, index) => (
            <motion.div
              key={lesson.id}
              draggable
              onDragStart={(e) => handleDragStart(e, lesson.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, lesson.id)}
              onDragEnd={handleDragEnd}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`group/item p-3 rounded-lg border-2 transition-all ${
                selectedLessonId === lesson.id
                  ? "bg-gradient-to-r from-blue-100 to-purple-100 border-blue-500 shadow-md"
                  : "bg-gray-50 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
              } ${
                draggedLessonId === lesson.id ? "opacity-40" : ""
              }`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <div className="flex items-start gap-2">
                {/* Drag handle */}
                <div className="pt-1 text-gray-400 cursor-grab active:cursor-grabbing hover:text-gray-600 transition flex-shrink-0">
                  <GripVertical className="w-4 h-4" />
                </div>

                {/* Lesson number and content */}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-gray-500 mb-1">
                    Lesson {index + 1}
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
      <div className="px-3 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-600">
        <p>Drag to reorder lessons</p>
      </div>
    </div>
  )
}
