// /src/components/courseBuilder/ProgressBar.jsx
import React from "react"
import { AlertCircle, CheckCircle, Loader } from "lucide-react"

/**
 * Progress bar component for async operations
 */
export function ProgressBar({ 
  progress = 0,
  status = "loading", // loading | success | error | idle
  message = "Loading...",
  error = null,
}) {
  if (status === "idle") return null

  const isLoading = status === "loading"
  const isSuccess = status === "success"
  const isError = status === "error"

  return (
    <div className={`fixed bottom-6 right-6 w-80 rounded-lg shadow-lg border-2 overflow-hidden transition-all duration-300 ${
      isError ? "bg-red-50 border-red-300" :
      isSuccess ? "bg-green-50 border-green-300" :
      "bg-white border-blue-300"
    }`}>
      {/* Content */}
      <div className="p-4">
        <div className="flex items-center gap-3 mb-2">
          {isLoading && <Loader className="w-5 h-5 text-blue-600 animate-spin" />}
          {isSuccess && <CheckCircle className="w-5 h-5 text-green-600" />}
          {isError && <AlertCircle className="w-5 h-5 text-red-600" />}
          <span className={`text-sm font-semibold ${
            isError ? "text-red-900" :
            isSuccess ? "text-green-900" :
            "text-gray-900"
          }`}>
            {message}
          </span>
        </div>

        {/* Progress bar */}
        {isLoading && (
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        )}

        {/* Error details */}
        {isError && error && (
          <p className="text-xs text-red-700 mt-2">{error}</p>
        )}
      </div>

      {/* Auto-dismiss for success */}
      {isSuccess && (
        <div className="h-1 bg-gradient-to-r from-green-400 to-green-500 animate-pulse" />
      )}
    </div>
  )
}

/**
 * Inline progress indicator for embedded use
 */
export function InlineProgress({
  show = false,
  message = "Processing...",
  size = "sm", // sm | md | lg
}) {
  if (!show) return null

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className="flex items-center gap-2 text-gray-600">
      <Loader className={`${sizeClasses[size]} animate-spin`} />
      {message && <span className="text-sm font-medium">{message}</span>}
    </div>
  )
}
