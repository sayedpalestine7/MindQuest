// /src/components/LessonEditor.jsx
import React from "react"
import {
  BookOpen,
  FileText,
  ImageIcon,
  Youtube,
  Code2,
  HelpCircle,
  Gamepad2,
  Sparkles,
  Upload,
  Trash2,
  GripVertical,
} from "lucide-react"
import { Button, Input, Textarea, Select, Card } from "./UI"

export default function LessonEditor({
  selectedLesson,
  draggedFieldId,
  handleFieldDragStart,
  handleFieldDragOver,
  handleFieldDrop,
  handleFieldDragEnd,
  addField,
  deleteField,
  updateField,
  handleHtmlFileUpload,
  handleImageUpload,
}) {
  if (!selectedLesson) {
    return (
      <Card className="p-8 text-center text-gray-500">
        <p>No lesson selected.</p>
      </Card>
    )
  }

  return (
    <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {selectedLesson.title}
      </h2>

      {/* Add Field Buttons */}
      <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-gray-300">
        <p className="text-sm font-semibold text-gray-800 mb-3">
          Add Content Block:
        </p>
        <div className="flex flex-wrap gap-2">
          <FieldButton icon={<FileText className="w-4 h-4 text-blue-600" />} label="Paragraph" onClick={() => addField("paragraph")} />
          <FieldButton icon={<ImageIcon className="w-4 h-4 text-purple-600" />} label="Image" onClick={() => addField("image")} />
          <FieldButton icon={<Youtube className="w-4 h-4 text-pink-600" />} label="YouTube" onClick={() => addField("youtube")} />
          <FieldButton icon={<Code2 className="w-4 h-4 text-green-600" />} label="Code" onClick={() => addField("code")} />
          <FieldButton icon={<HelpCircle className="w-4 h-4 text-orange-600" />} label="Question" onClick={() => addField("question")} />
          <FieldButton icon={<Gamepad2 className="w-4 h-4 text-purple-600" />} label="Mini-game" onClick={() => addField("minigame")} />
          <FieldButton icon={<Sparkles className="w-4 h-4 text-blue-600" />} label="Animation" onClick={() => addField("animation")} />
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4">
        {selectedLesson.fields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No content blocks yet. Add your first block above!</p>
          </div>
        ) : (
          selectedLesson.fields.map((field) => (
            <div
              key={field.id}
              draggable
              onDragStart={(e) => handleFieldDragStart(e, field.id)}
              onDragOver={handleFieldDragOver}
              onDrop={(e) => handleFieldDrop(e, field.id)}
              onDragEnd={handleFieldDragEnd}
              className={`p-4 bg-white rounded-xl border-2 border-gray-300 hover:border-blue-500 transition-colors cursor-move ${draggedFieldId === field.id ? "opacity-50" : ""
                }`}
            >
              {/* Field Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing" />
                  {getFieldIcon(field.type)}
                  <span className="text-sm font-semibold text-gray-900 capitalize">
                    {field.type}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteField(field.id)}
                  className="h-8 w-8 p-0 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>

              {/* Field Content Inputs */}
              <FieldContent
                field={field}
                updateField={updateField}
                handleImageUpload={handleImageUpload}
                handleHtmlFileUpload={handleHtmlFileUpload}
              />
            </div>
          ))
        )}
      </div>
    </Card>
  )
}

/* --- Subcomponents --- */

function FieldButton({ icon, label, onClick }) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="gap-2 border-2 hover:border-blue-500 hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all duration-200"
    >
      {icon}
      {label}
    </Button>
  )
}

function getFieldIcon(type) {
  const icons = {
    paragraph: <FileText className="w-5 h-5 text-blue-600" />,
    image: <ImageIcon className="w-5 h-5 text-purple-600" />,
    youtube: <Youtube className="w-5 h-5 text-pink-600" />,
    code: <Code2 className="w-5 h-5 text-green-600" />,
    question: <HelpCircle className="w-5 h-5 text-orange-600" />,
    minigame: <Gamepad2 className="w-5 h-5 text-purple-600" />,
    animation: <Sparkles className="w-5 h-5 text-blue-600" />,
  }
  return icons[type] || null
}

/* --- Field Type Rendering --- */
function FieldContent({ field, updateField, handleImageUpload, handleHtmlFileUpload }) {
  switch (field.type) {
    case "paragraph":
      return (
        <Textarea
          value={field.content}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder="Enter your text content..."
          rows={4}
          className="border-2 border-gray-300 resize-none"
        />
      )

    case "image":
      return (
        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <Input
              value={field.content}
              onChange={(e) => updateField(field.id, e.target.value)}
              placeholder="Enter image URL or upload..."
              className="border-2 flex-1 border-gray-300"
            />
            <label className="cursor-pointer">
              <Button variant="outline" className="gap-2 border-2 bg-transparent" asChild>
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
                  if (file) handleImageUpload(file, field.id)
                }}
              />
            </label>
          </div>
          {field.content && (
            <img
              src={field.content}
              alt="Field Preview"
              className="w-full h-48 object-cover rounded-lg border-2 border-gray-300"
            />
          )}
        </div>
      )

    case "youtube":
      return (
        <Input
          value={field.content}
          onChange={(e) => updateField(field.id, e.target.value)}
          placeholder="Enter YouTube video URL..."
          className="border-2 border-gray-300"
        />
      )

    case "code":
      return (
        <div className="space-y-2">
          <Select
            value={field.language || "javascript"}
            onChange={(e) =>
              updateField(field.id, field.content, undefined, e.target.value, field.answer, field.explanation)
            }
            className="rounded-md border-gray-300 w-48"
          >
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="typescript">TypeScript</option>
          </Select>
          <Textarea
            value={field.content}
            onChange={(e) =>
              updateField(field.id, e.target.value, undefined, field.language, field.answer, field.explanation)
            }
            placeholder="Enter your code here..."
            rows={8}
            className="border-2 border-gray-300 resize-none font-mono text-sm"
          />
        </div>
      )

    case "question":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Question
            </label>
            <Textarea
              value={field.content}
              onChange={(e) => updateField(field.id, e.target.value, undefined, field.language, field.answer, field.explanation)}
              placeholder="Enter the question..."
              rows={2}
              className="border-2 border-gray-300 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Correct Answer
            </label>
            <Input
              value={field.answer || ""}
              onChange={(e) => updateField(field.id, field.content, undefined, field.language, e.target.value, field.explanation)}
              placeholder="Enter the correct answer..."
              className="border-2 border-gray-300"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Explanation
            </label>
            <Textarea
              value={field.explanation || ""}
              onChange={(e) => updateField(field.id, field.content, undefined, field.language, field.answer, e.target.value)}
              placeholder="Explain the answer..."
              rows={3}
              className="border-2 border-gray-300 resize-none"
            />
          </div>
        </div>
      )

    case "minigame":
    case "animation":
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept=".html"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleHtmlFileUpload(field.id, file)
            }}
            className="border-2 border-gray-300"
          />
          {field.content && (
            <p className="text-sm text-gray-500">
              Selected: {field.content}
            </p>
          )}
          {field.htmlContent && (
            <div className="mt-3 rounded-lg border-2 border-gray-300 overflow-hidden">
              <iframe
                srcDoc={field.htmlContent}
                className="w-full min-h-[500px] bg-white"
                title={`${field.type} preview`}
                sandbox="allow-scripts"
              />
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}
