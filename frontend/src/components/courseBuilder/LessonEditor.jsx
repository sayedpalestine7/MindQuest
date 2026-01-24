// /src/components/LessonEditor.jsx
import React, { useRef } from "react"
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
  ChevronRight,
  Table as TableIcon,
  Maximize2,
  Download,
} from "lucide-react"
import { Button, Input, Textarea, Select, Card } from "./UI"
import AnimationSelector from "./AnimationSelector"
import FloatingAddContent from "./FloatingAddContent"
import { useStickyVisibility } from "../../hooks/useStickyVisibility"
import { TextAreaInput, FileInput } from "./FieldInputs"
import { RichTextInput } from "./RichTextInput"
import { downloadHtml } from "../../utils/courseBuilderUtils"
import toast from "react-hot-toast"

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
  onNavigateToQuiz,
}) {
  const { stickyRef, stickyClassName } = useStickyVisibility()

  if (!selectedLesson) {
    return (
      <Card className="p-12 text-center border-2 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
          <BookOpen className="w-8 h-8 text-gray-600" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Lesson Selected</h2>
        <p className="text-gray-600 mb-4">
          Select a lesson from the left panel to start editing its content.
        </p>
        <p className="text-sm text-gray-500">
          💡 Create your first lesson by clicking "Add Lesson" in the sidebar
        </p>
      </Card>
    )
  }

  return (
    <>
      <Card className="p-8 border-2 hover:shadow-lg transition-shadow">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {selectedLesson.title}
        </h2>

        {/* Add Field Buttons - STICKY */}
        <div ref={stickyRef} className={`top-11 z-0 mb-6 p-4 rounded-xl  flex flex-col ${stickyClassName}`}>
          <p className="text-sm font-semibold text-gray-800 mb-3">
            Add Content Block:
          </p>
          <div className="flex flex-wrap gap-2 justify-center p-3 rounded-lg w-fit ">
            <FieldButton icon={<FileText className="w-4 h-4 text-blue-600" />} label="Paragraph" onClick={() => addField("paragraph")} type={"paragraphBtn"} />
            <FieldButton icon={<ImageIcon className="w-4 h-4 text-purple-600" />} label="Image" onClick={() => addField("image")} type={"imageBtn"} />
            <FieldButton icon={<Youtube className="w-4 h-4 text-pink-600" />} label="YouTube" onClick={() => addField("youtube")} type={"youtubeBtn"} />
            <FieldButton icon={<Code2 className="w-4 h-4 text-green-600" />} label="Code" onClick={() => addField("code")} type={"codeBtn"} />
            <FieldButton icon={<TableIcon className="w-4 h-4 text-teal-600" />} label="Table" onClick={() => addField("table")} type={"tableBtn"} />
            <FieldButton icon={<HelpCircle className="w-4 h-4 text-orange-600" />} label="Question" onClick={() => addField("question")} type={"questionBtn"} />
            <FieldButton icon={<Gamepad2 className="w-4 h-4 text-purple-600" />} label="Mini-game" onClick={() => addField("minigame")} type={"gameBtn"} />
            <FieldButton icon={<Sparkles className="w-4 h-4 text-blue-600" />} label="Animation" onClick={() => addField("animation")} type={"animationBtn"} />
          </div>
        </div>

        {/* Fields List */}
        <div className="space-y-4">
          {selectedLesson.fields.length === 0 ? (
            <div className="text-center py-16 px-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Start Building Your Lesson</h3>
              <p className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
                Add content blocks to create engaging educational material. You can mix text, images, videos, code, and interactive elements!
              </p>
              <p className="text-xs text-gray-500">Pick a content type above to begin</p>
            </div>
          ) : (
            selectedLesson.fields.map((field) => (
              <div
                id={`field-${field.id}`}
                key={field.id}
                className={`p-4 bg-white rounded-xl border-gray-300 hover:border-2 hover:border-gray-400 ${getFieldHoverBorderColor(field.type)} hover:shadow-md
                  }`} // border here
              >
                {/* Field Header with Draggable Grip */}
                <div
                  draggable
                  onDragStart={(e) => handleFieldDragStart(e, field.id)}
                  onDragOver={handleFieldDragOver}
                  onDrop={(e) => handleFieldDrop(e, field.id)}
                  onDragEnd={handleFieldDragEnd}
                  className="flex items-center justify-between mb-3 cursor-move select-none"
                >
                  <div className="flex items-center gap-2">
                    <GripVertical className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0" />
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

                {/* Field Content Inputs - NO DRAG */}
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

        {/* Workflow Navigation */}
        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between items-center">
          <p className="text-sm text-gray-600"><span className="font-semibold">Lessons done?</span> Create a quiz to test your students.</p>
          <Button
            onClick={onNavigateToQuiz}
            className="gap-2 bg-blue-600 hover:from-blue-600 hover:to-blur-700 text-white shadow-md hover:shadow-lg transition-all"
          > 
            Create Quiz
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </Card>

      {/* Floating Add Content Button */}
      <FloatingAddContent addField={addField} selectedLesson={selectedLesson} />
    </>
  )
}

/* --- Subcomponents --- */

function FieldButton({ icon, label, onClick, type }) {
  return (
    <Button
      onClick={onClick}
      variant={type}
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
    table: <TableIcon className="w-5 h-5 text-teal-600" />,
    question: <HelpCircle className="w-5 h-5 text-orange-600" />,
    minigame: <Gamepad2 className="w-5 h-5 text-purple-600" />,
    animation: <Sparkles className="w-5 h-5 text-blue-600" />,
  }
  return icons[type] || null
}

function getFieldBorderColor(type) {
  const colors = {
    paragraph: "border-l-blue-500",
    image: "border-l-purple-500",
    youtube: "border-l-pink-500",
    code: "border-l-green-500",
    table: "border-l-teal-500",
    question: "border-l-orange-500",
    minigame: "border-l-indigo-500",
    animation: "border-l-cyan-500",
  }
  return colors[type] || "border-l-gray-300"
}

function getFieldHoverBorderColor(type) {
  const colors = {
    paragraph: "hover:border-blue-600",
    image: "hover:border-purple-600",
    youtube: "hover:border-pink-600",
    code: "hover:border-green-600",
    table: "hover:border-teal-600",
    question: "hover:border-orange-600",
    minigame: "hover:border-indigo-600",
    animation: "hover:border-cyan-600",
  }
  return colors[type] || "hover:border-l-gray-400"
}

/* --- Field Type Rendering --- */
function FieldContent({ field, updateField, handleImageUpload, handleHtmlFileUpload }) {
  switch (field.type) {
    case "paragraph":
      return (
        <RichTextInput
          value={field.content}
          onChange={(e) => updateField(field.id, { content: e.target.value })}
          placeholder="Enter your text content..."
          required
        />
      )

    case "image":
      return (
        <FileInput
          label="Image"
          value={field.content}
          onChange={(e) => updateField(field.id, { content: e.target.value })}
          onFileUpload={(file) => handleImageUpload(file, field.id)}
          previewType="image"
          accept="image/*"
          // helper="Upload an image or paste an image URL"
          required
        />
      )

    case "youtube":
      return (
        <Input
          value={field.content}
          onChange={(e) => updateField(field.id, { content: e.target.value })}
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
              updateField(field.id, { language: e.target.value })
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
              updateField(field.id, { content: e.target.value })
            }
            placeholder="Enter your code here..."
            rows={8}
            className="border-2 border-gray-300 resize-none font-mono text-sm"
          />
        </div>
      )

    case "table":
      return <TableEditor field={field} updateField={updateField} />

    case "question":
      return (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-2">
              Question
            </label>
            <Textarea
              value={field.content}
              onChange={(e) => updateField(field.id, { content: e.target.value })}
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
              value={field.correctAnswer ?? field.answer ?? ""}
              onChange={(e) => updateField(field.id, { correctAnswer: e.target.value, answer: e.target.value })}
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
              onChange={(e) => updateField(field.id, { explanation: e.target.value })}
              placeholder="Explain the answer..."
              rows={3}
              className="border-2 border-gray-300 resize-none"
            />
          </div>
        </div>
      )

    case "minigame":
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
              Selected: {field.htmlFilename ? field.htmlFilename : (field.content && String(field.content).startsWith('data:') ? 'HTML content added' : field.content)}
            </p>
          )}
          {field.content && (
            <>
              <MiniGamePreview src={field.content} title={`${field.type} preview`} />
              {field.htmlContent && (
                <Button
                  onClick={() => {
                    try {
                      downloadHtml(
                        field.htmlContent, 
                        field.htmlFilename || 'animation.html'
                      )
                      toast.success('HTML file downloaded')
                    } catch (err) {
                      toast.error('Failed to download HTML')
                    }
                  }}
                  className="w-full gap-2 bg-purple-600 hover:bg-purple-700 text-white"
                >
                  <Download className="w-4 h-4" />
                  Download HTML
                </Button>
              )}
            </>
          )}
        </div>
      )

    case "animation":
      return (
        <div className="space-y-3">
          <AnimationSelector
            selectedAnimationId={field.animationId}
            onSelect={(animationId) => updateField(field.id, { animationId })}
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Playback mode:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1">
              <button
                type="button"
                onClick={() => updateField(field.id, { animationPreviewMode: "start-stop" })}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  (field.animationPreviewMode || "start-stop") === "start-stop"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Start/Stop
              </button>
              <button
                type="button"
                onClick={() => updateField(field.id, { animationPreviewMode: "loop" })}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition ${
                  (field.animationPreviewMode || "start-stop") === "loop"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                Loop (GIF)
              </button>
            </div>
          </div>
        </div>
      )

    default:
      return null
  }
}

function MiniGamePreview({ src, title }) {
  const iframeRef = useRef(null)

  const handleFullscreen = () => {
    const el = iframeRef.current
    if (!el) return
    const request = el.requestFullscreen || el.webkitRequestFullscreen || el.mozRequestFullScreen || el.msRequestFullscreen
    if (request) request.call(el)
  }

  return (
    <div className="mt-3 rounded-lg border-2 border-gray-300 overflow-hidden relative">
      <div className="absolute bottom-2 right-2 z-10">
        <Button
          size="sm"
          variant="ghost"
          onClick={handleFullscreen}
          className="bg-black/60 hover:bg-black/75 text-white border border-white/20 shadow-sm h-9 w-9 p-0"
          aria-label="Full screen"
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full min-h-[500px] bg-white"
        title={title}
        sandbox="allow-scripts"
        allow="fullscreen"
      />
    </div>
  )
}

/* --- Table Editor Component --- */
function TableEditor({ field, updateField }) {
  // Derive table data without mutation
  const tableData = React.useMemo(() => {
    const content = field.content || { rows: 3, columns: 3, data: [] }
    
    // Initialize empty data array if needed (non-mutating)
    if (!content.data || content.data.length === 0) {
      const rows = content.rows || 3
      const columns = content.columns || 3
      return {
        ...content,
        rows,
        columns,
        data: Array(rows).fill(null).map(() => Array(columns).fill(""))
      }
    }
    
    return content
  }, [field.content])

  const handleRowsChange = (newRows) => {
    const rows = Math.max(1, Math.min(20, parseInt(newRows) || 3))
    const currentData = tableData.data || []
    
    // Adjust data array
    let newData = [...currentData]
    if (rows > currentData.length) {
      // Add new rows
      for (let i = currentData.length; i < rows; i++) {
        newData.push(Array(tableData.columns || 3).fill(""))
      }
    } else {
      // Remove rows
      newData = newData.slice(0, rows)
    }
    
    updateField(field.id, {
      content: { ...tableData, rows, data: newData }
    })
  }

  const handleColumnsChange = (newColumns) => {
    const columns = Math.max(1, Math.min(10, parseInt(newColumns) || 3))
    const currentData = tableData.data || []
    
    // Adjust data array
    const newData = currentData.map(row => {
      const newRow = [...(row || [])]
      if (columns > newRow.length) {
        // Add new columns
        return [...newRow, ...Array(columns - newRow.length).fill("")]
      } else {
        // Remove columns
        return newRow.slice(0, columns)
      }
    })
    
    updateField(field.id, {
      content: { ...tableData, columns, data: newData }
    })
  }

  const handleCellChange = (rowIndex, colIndex, value) => {
    // Deep clone to avoid mutating nested rows
    const newData = (tableData.data || []).map(row => [...(row || [])])
    if (!newData[rowIndex]) {
      newData[rowIndex] = []
    }
    // Clone the specific row before modifying
    newData[rowIndex] = [...(newData[rowIndex] || [])]
    newData[rowIndex][colIndex] = value
    
    updateField(field.id, {
      content: { ...tableData, data: newData }
    })
  }

  return (
    <div className="space-y-4">
      {/* Table size controls */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Rows
          </label>
          <Input
            type="number"
            min="1"
            max="20"
            value={tableData.rows || 3}
            onChange={(e) => handleRowsChange(e.target.value)}
            className="w-24 border-2 border-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Columns
          </label>
          <Input
            type="number"
            min="1"
            max="10"
            value={tableData.columns || 3}
            onChange={(e) => handleColumnsChange(e.target.value)}
            className="w-24 border-2 border-gray-300"
          />
        </div>
      </div>

      {/* Table editor */}
      <div className="overflow-x-auto">
        <table className="w-full border-2 border-gray-300">
          <tbody>
            {tableData.data && tableData.data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row && row.map((cell, colIndex) => (
                  <td key={colIndex} className="border border-gray-300 p-0">
                    <Input
                      value={cell || ""}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      placeholder={`R${rowIndex + 1}C${colIndex + 1}`}
                      className="border-0 rounded-none w-full min-w-[100px]"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
