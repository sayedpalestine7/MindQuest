import React from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import { TextStyle, Color as TextColor, BackgroundColor, FontSize } from "@tiptap/extension-text-style"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading2,
  RotateCcw,
  Highlighter,
  Palette,
  Eye,
} from "lucide-react"
import { Button } from "./UI"
import "./RichTextInput.css"

/**
 * RichTextInput Component
 * A rich text editor for lesson paragraphs with formatting capabilities:
 * - Bold, Italic, Underline
 * - Font size (12px - 32px)
 * - Text color
 * - Highlight/background color
 * - Lists (ordered and unordered)
 * - Code blocks
 * - Block quotes
 * - Headings
 */
export function RichTextInput({
  label,
  value,
  onChange,
  placeholder = "Enter your text content...",
  error,
  helper,
  required = false,
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle.configure({ types: ["textStyle"] }),
      TextColor.configure({ types: ["textStyle"] }),
      BackgroundColor.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
    ],
    content: value || "<p></p>",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange({ target: { value: html } })
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none",
      },
    },
  })

  // Helper function to apply inline styles using TextStyle mark
  const applyInlineStyle = (styleProperty, styleValue) => {
    if (!editor) return

    const { from, to } = editor.state.selection
    if (from === to) {
      editor.chain().focus().run()
      return
    }

    const attrs = {}
    if (styleProperty === "fontSize") attrs.fontSize = styleValue
    if (styleProperty === "color") attrs.color = styleValue
    if (styleProperty === "backgroundColor") attrs.backgroundColor = styleValue

    console.debug("applyInlineStyle", styleProperty, styleValue, attrs)

    // Use TextStyle's toggleTextStyle command to apply attributes
    if (editor.commands.toggleTextStyle) {
      editor.chain().focus().toggleTextStyle(attrs).run()
    } else {
      editor.chain().focus().setMark("textStyle", attrs).run()
    }
  }

  if (!editor) {
    return null
  }

  const [preview, setPreview] = React.useState(false)

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`border-2 rounded-lg overflow-hidden ${error ? "border-red-400" : "border-gray-300"}`}>
        {/* Toolbar */}
        <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-1">
          {/* Text Style Group */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              icon={<Heading2 className="w-4 h-4" />}
              title="Heading"
              isActive={editor.isActive("heading", { level: 2 })}
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            />
            <ToolbarButton
              icon={<Bold className="w-4 h-4" />}
              title="Bold"
              isActive={editor.isActive("bold")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            />
            <ToolbarButton
              icon={<Italic className="w-4 h-4" />}
              title="Italic"
              isActive={editor.isActive("italic")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            />
            <ToolbarButton
              icon={<Underline className="w-4 h-4" />}
              title="Underline"
              isActive={editor.isActive("underline")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            />
          </div>

          {/* List Group */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              icon={<List className="w-4 h-4" />}
              title="Bullet List"
              isActive={editor.isActive("bulletList")}
              onClick={() => {
                console.debug('toggleBulletList command available?', !!editor.commands.toggleBulletList)
                if (editor.commands.toggleBulletList) {
                  editor.chain().focus().toggleBulletList().run()
                } else {
                  // fallback: attempt to toggle textStyle or inform
                  console.error('toggleBulletList command not available')
                }
              }}
            />
            <ToolbarButton
              icon={<ListOrdered className="w-4 h-4" />}
              title="Numbered List"
              isActive={editor.isActive("orderedList")}
              onClick={() => {
                console.debug('toggleOrderedList command available?', !!editor.commands.toggleOrderedList)
                if (editor.commands.toggleOrderedList) {
                  editor.chain().focus().toggleOrderedList().run()
                } else {
                  console.error('toggleOrderedList command not available')
                }
              }}
            />
          </div>

          {/* Block Group */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            <ToolbarButton
              icon={<Code className="w-4 h-4" />}
              title="Code Block"
              isActive={editor.isActive("codeBlock")}
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            />
            <ToolbarButton
              icon={<Quote className="w-4 h-4" />}
              title="Block Quote"
              isActive={editor.isActive("blockquote")}
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
            />
          </div>

          {/* Formatting Group */}
          <div className="flex gap-1 border-r border-gray-300 pr-2">
            {/* Font Size Dropdown */}
            <select
              onChange={(e) => {
                if (e.target.value) {
                  applyInlineStyle("fontSize", e.target.value)
                  e.target.value = ""
                }
              }}
              className="text-xs px-2 py-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
              title="Font Size"
            >
              <option value="">Size</option>
              <option value="12px">12px</option>
              <option value="14px">14px</option>
              <option value="16px">16px</option>
              <option value="18px">18px</option>
              <option value="20px">20px</option>
              <option value="24px">24px</option>
              <option value="28px">28px</option>
              <option value="32px">32px</option>
            </select>

            {/* Text Color */}
            <div className="relative group">
              <div className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100">
                <Palette className="w-4 h-4 text-gray-700" />
                <span className="text-xs">Color</span>
              </div>
              <div className="absolute top-full left-0 hidden group-hover:flex flex-wrap gap-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-50 w-32">
                {[
                  "#000000",
                  "#EF4444",
                  "#F97316",
                  "#EAB308",
                  "#22C55E",
                  "#0EA5E9",
                  "#6366F1",
                  "#EC4899",
                  "#6B7280",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => applyInlineStyle("color", color)}
                    className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={`Color ${color}`}
                  />
                ))}
              </div>
            </div>

            {/* Highlight Color */}
            <div className="relative group">
              <div className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded cursor-pointer hover:bg-gray-100">
                <Highlighter className="w-4 h-4 text-gray-700" />
                <span className="text-xs">Highlight</span>
              </div>
              <div className="absolute top-full left-0 hidden group-hover:flex flex-wrap gap-1 p-2 bg-white border border-gray-300 rounded shadow-lg z-50 w-32">
                {[
                  "#FBBF24",
                  "#86EFAC",
                  "#93C5FD",
                  "#F472B6",
                  "#DDD6FE",
                  "#FCA5A5",
                  "#FFFFFF",
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => applyInlineStyle("backgroundColor", color)}
                    className="w-6 h-6 rounded border-2 hover:scale-110 transition-transform"
                    style={{ backgroundColor: color }}
                    title={`Highlight ${color}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Reset Group */}
          <div className="flex gap-1">
            <ToolbarButton
              icon={<RotateCcw className="w-4 h-4" />}
              title="Clear Formatting"
              onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
            />
            <ToolbarButton
              icon={<Eye className="w-4 h-4" />}
              title={preview ? "Exit Preview" : "Preview"}
              isActive={preview}
              onClick={() => setPreview((v) => !v)}
            />
          </div>
        </div>

        {/* Editor Content Area - use course page typography so preview matches student view */}
        {!preview ? (
          <div className="min-h-[200px] rich-text-editor prose prose-sm max-w-none text-gray-800 leading-relaxed mq-prose">
            <EditorContent editor={editor} />
          </div>
        ) : (
          <div className="p-8 border-2 hover:shadow-lg transition-shadow space-y-6 bg-transparent">
            <div
              className="text-gray-800 leading-relaxed prose prose-sm max-w-none mq-prose"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

/**
 * Toolbar button component
 */
function ToolbarButton({ icon, title, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        isActive
          ? "bg-blue-500 text-white"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
      }`}
    >
      {icon}
    </button>
  )
}
