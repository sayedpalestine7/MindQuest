// /src/components/courseBuilder/FieldInputs.jsx
import React, { useState } from "react"
import { Upload, Eye, EyeOff } from "lucide-react"
import { Input, Textarea, Select, Button } from "./UI"

/**
 * Reusable field input components for consistent styling and UX
 */

/**
 * Text Input with label and helper text
 */
export function TextInput({ label, value, onChange, placeholder, helper, error, required = false }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`border-2 ${error ? "border-red-400 focus:ring-red-300" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

/**
 * Text Area with character counter and auto-expand
 */
export function TextAreaInput({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
  helper,
  error,
  required = false,
}) {
  const charCount = value?.length || 0
  const isNearLimit = maxLength && charCount >= maxLength * 0.9
  const textareaRef = React.useRef(null)

  React.useEffect(() => {
    if (textareaRef.current) {
      // Reset height to auto to properly calculate scrollHeight
      textareaRef.current.style.height = "auto"
      // Set height based on scrollHeight
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [value])

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {/* {required && <span className="text-red-500 ml-1">*</span>} */}
        </label>
        {/* {maxLength && (
          <span className={`text-xs font-medium ${isNearLimit ? "text-orange-500" : "text-gray-500"}`}>
            {charCount}/{maxLength}
          </span>
        )} */}
      </div>
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={`border-2 resize-none overflow-hidden ${error ? "border-red-400 focus:ring-red-300" : "border-gray-300"}`}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

/**
 * Select input with label
 */
export function SelectInput({ label, value, onChange, options, error, helper, required = false }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <Select value={value} onChange={onChange} className={error ? "border-red-400" : ""}>
        <option value="">Select {label.toLowerCase()}...</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </Select>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}
    </div>
  )
}

/**
 * URL/File Input with preview
 */
export function FileInput({
  label,
  value,
  onChange,
  onFileUpload,
  previewType = "image", // 'image' | 'video' | 'code' | 'none'
  accept,
  error,
  helper,
  required = false,
}) {
  const [showPreview, setShowPreview] = useState(true)

  return (
    <div className="mb-4">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
        {/* {required && <span className="text-red-500 ml-1">*</span>} */}
      </label>

      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            value={value}
            onChange={onChange}
            placeholder="Enter URL or upload file..."
            className={`border-2 ${error ? "border-red-400" : "border-gray-300"}`}
          />
        </div>

        <label className="cursor-pointer">
          <Button
            type="button"
            variant="outline"
            className="gap-2 border-2 bg-white"
            asChild
          >
            <span>
              <Upload className="w-4 h-4 text-gray-600" />
              Upload
            </span>
          </Button>
          <input
            type="file"
            accept={accept}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file && onFileUpload) {
                onFileUpload(file)
              }
            }}
          />
        </label>

        {value && previewType !== "none" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="p-2 h-auto"
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4 text-gray-600" />
            ) : (
              <Eye className="w-4 h-4 text-gray-600" />
            )}
          </Button>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {helper && !error && <p className="text-xs text-gray-500 mt-1">{helper}</p>}

      {/* Preview Section */}
      {value && showPreview && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          {previewType === "image" && (
            <img
              src={value}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          )}
          {previewType === "video" && (
            <div className="relative w-full">
              <iframe
                src={value}
                title="Preview"
                className="w-full h-40 rounded-lg"
                allowFullScreen
              />
            </div>
          )}
          {previewType === "code" && (
            <pre className="w-full h-40 overflow-auto p-2 bg-gray-900 text-gray-100 rounded-lg text-xs font-mono">
              {value}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Option inputs for multiple choice questions
 */
export function OptionsInput({
  options = [],
  onAddOption,
  onUpdateOption,
  onDeleteOption,
  onSelectCorrect,
  correctIndex,
  error,
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-gray-700">
          Answer Options <span className="text-red-500">*</span>
        </label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddOption}
          className="gap-1 border-2"
        >
          + Add Option
        </Button>
      </div>

      <div className="space-y-2">
        {options.map((option, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <input
              type="radio"
              name="correct-answer"
              checked={correctIndex === idx}
              onChange={() => onSelectCorrect(idx)}
              className="w-4 h-4 text-blue-600 cursor-pointer"
              title="Mark as correct answer"
            />
            <Input
              value={option}
              onChange={(e) => onUpdateOption(idx, e.target.value)}
              placeholder={`Option ${idx + 1}`}
              className="border-2 border-gray-300 flex-1"
            />
            {options.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onDeleteOption(idx)}
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                ✕
              </Button>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      <p className="text-xs text-gray-500 mt-2">Click the radio button to mark the correct answer</p>
    </div>
  )
}
