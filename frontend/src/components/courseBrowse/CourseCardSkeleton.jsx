import { motion } from "framer-motion"

export default function CourseCardSkeleton({ index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      className="bg-white rounded-xl overflow-hidden border"
    >
      {/* Image skeleton */}
      <div className="h-48 bg-gray-200 animate-pulse" />

      <div className="p-5">
        {/* Category badge skeleton */}
        <div className="h-6 w-24 bg-gray-200 animate-pulse rounded mb-3" />
        
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 animate-pulse rounded mb-2 w-3/4" />
        
        {/* Description skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
        </div>

        {/* Instructor skeleton */}
        <div className="h-4 w-32 bg-gray-200 animate-pulse rounded mb-3" />

        {/* Stats skeleton */}
        <div className="flex gap-4 mb-4">
          <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
        </div>

        {/* Footer skeleton */}
        <div className="pt-4 border-t flex items-center justify-between">
          <div className="h-6 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="h-9 w-24 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
    </motion.div>
  )
}
