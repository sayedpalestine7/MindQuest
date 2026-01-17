import { motion } from "framer-motion"
import { AlertCircle, RefreshCw } from "lucide-react"

export default function ErrorState({ error, onRetry }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>

        {/* Message */}
        <h3 className="text-xl font-bold text-red-900 mb-2">
          {error?.title || "Failed to load courses"}
        </h3>
        <p className="text-red-700 mb-6">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>

        {/* Retry Button */}
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        )}
      </div>
    </motion.div>
  )
}
