// /src/components/Sidebar.jsx
import React from "react"
import { Plus, Trash2, GripVertical } from "lucide-react"
import { Button, Input, Card } from "./UI"

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
    <aside className="w-80">
      <Card className="h-fit sticky top-24 p-6 border-2 hover:shadow-lg transition-shadow">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 whitespace-nowrap">
            Lessons
          </h2>
          <Button
            size="sm"
            onClick={addLesson}
            className="gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-700 hover:to-pink-700 text-white"
          >
            <Plus className="w-4 h-4" />
            Add
          </Button>
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              draggable
              onDragStart={(e) => handleDragStart(e, lesson.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, lesson.id)}
              onDragEnd={handleDragEnd}
              className={`group/item flex items-center gap-2 p-3 rounded-lg border-2 cursor-move transition-all
                ${
                  selectedLessonId === lesson.id
                    ? "bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 border-black shadow-md"
                    : "bg-white border-gray-300 hover:border-black/50 hover:shadow-sm"
                }
                ${draggedLessonId === lesson.id ? "opacity-50" : ""}`}
              onClick={() => setSelectedLessonId(lesson.id)}
            >
              <GripVertical className="w-4 h-4 text-gray-500 flex-shrink-0 cursor-grab active:cursor-grabbing" />
              <Input
                value={lesson.title}
                onChange={(e) => updateLessonTitle(lesson.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="flex-1 h-8 border-0 bg-transparent focus:ring-1 text-sm font-medium text-gray-800"
              />
              {lessons.length > 1 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteLesson(lesson.id)
                  }}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity h-8 w-8 p-0 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </aside>
  )
}
