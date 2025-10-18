import { Search, Filter, TrendingUp } from "lucide-react"

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topics, or skills..."
            className="w-full border border-gray-300 rounded-lg pl-10 h-12 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        {/* Category */}
        <div className="flex gap-3">
          <div className="flex items-center border border-gray-300 rounded-lg px-3">
            <Filter className="w-4 h-4 text-gray-500 mr-2" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 bg-transparent outline-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "all" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div className="flex items-center border border-gray-300 rounded-lg px-3">
            <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="h-10 bg-transparent outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
