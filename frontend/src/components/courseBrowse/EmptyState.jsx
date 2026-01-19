import { motion } from "framer-motion"
import { Search, FilterX } from "lucide-react"

export default function EmptyState({ 
  searchQuery, 
  selectedCategory, 
  selectedDifficulty,
  onClearFilters 
}) {
  const hasActiveFilters = searchQuery || selectedCategory !== "all" || selectedDifficulty !== "All Levels"

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="text-center py-16 px-6"
    >
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
          <Search className="w-12 h-12 text-gray-400" />
        </div>

        {/* Message */}
        <h3 className="text-2xl font-bold text-gray-900 mb-2">No courses found</h3>
        
        {hasActiveFilters ? (
          <>
            <p className="text-gray-600 mb-6">
              We couldn't find any courses matching your search criteria.
              {searchQuery && (
                <span className="block mt-2">
                  Searching for: <span className="font-semibold">"{searchQuery}"</span>
                </span>
              )}
            </p>
            <button
              onClick={onClearFilters}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FilterX className="w-4 h-4" />
              Clear all filters
            </button>
          </>
        ) : (
          <p className="text-gray-600">
            No courses are currently available. Check back soon!
          </p>
        )}
      </div>
    </motion.div>
  )
}
