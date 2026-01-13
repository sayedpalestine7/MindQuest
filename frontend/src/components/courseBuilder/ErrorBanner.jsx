// /src/components/courseBuilder/ErrorBanner.jsx
import React from "react"
import { AlertCircle, X, CheckCircle } from "lucide-react"
import { Button } from "./UI"

/**
 * Error/Alert Banner for displaying validation and system errors
 */
export function ErrorBanner({
  errors = [],
  onDismiss,
  type = "error", // error | warning | info | success
  dismissible = true,
}) {
  if (!errors || errors.length === 0) return null

  const typeStyles = {
    error: {
      bg: "bg-red-50",
      border: "border-red-300",
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
      title: "Validation Error",
      titleColor: "text-red-900",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-300",
      icon: <AlertCircle className="w-5 h-5 text-yellow-600" />,
      title: "Warning",
      titleColor: "text-yellow-900",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-300",
      icon: <AlertCircle className="w-5 h-5 text-blue-600" />,
      title: "Information",
      titleColor: "text-blue-900",
    },
    success: {
      bg: "bg-green-50",
      border: "border-green-300",
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
      title: "Success",
      titleColor: "text-green-900",
    },
  }

  const style = typeStyles[type] || typeStyles.error

  return (
    <div className={`${style.bg} border-2 ${style.border} rounded-lg p-4 mb-6`}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-0.5">{style.icon}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold ${style.titleColor} mb-2`}>
            {style.title}
            {errors.length > 1 && ` (${errors.length} issues)`}
          </h3>

          {/* Error list */}
          <ul className="space-y-1">
            {errors.map((error, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 flex-shrink-0">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Dismiss button */}
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-shrink-0 h-6 w-6 p-0 hover:bg-opacity-20"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

/**
 * Inline validation error for use under form fields
 */
export function InlineError({ error }) {
  if (!error) return null

  return (
    <div className="flex items-center gap-1 mt-1 text-red-600">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-medium">{error}</span>
    </div>
  )
}

/**
 * Field-level error message
 */
export function FieldError({ error, label }) {
  if (!error) return null

  return (
    <p className="text-xs text-red-600 mt-1 font-medium">
      {label && <span>{label}: </span>}
      {error}
    </p>
  )
}
