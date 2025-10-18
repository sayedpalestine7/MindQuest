import { useState } from "react"
import { Search, Filter, TrendingUp, ChevronDown, Check } from "lucide-react"

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  categories,
}) {
  const [openCategory, setOpenCategory] = useState(false)
  const [openDifficulty, setOpenDifficulty] = useState(false)

  const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* 🔍 Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topics, or skills..."
            className="w-full border border-gray-300 rounded-lg pl-10 h-12 focus:ring-2 focus:ring-indigo-400 outline-none"
          />
        </div>

        <div className="flex gap-3">
          {/* 🧭 Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenCategory(!openCategory)}
              className="flex items-center justify-between w-56 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                {selectedCategory === "all"
                  ? "All Categories"
                  : selectedCategory}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  openCategory ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCategory && (
              <div className="absolute mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <ul className="py-1">
                  {categories.map((cat) => {
                    const label = cat === "all" ? "All Categories" : cat
                    return (
                      <li
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat)
                          setOpenCategory(false)
                        }}
                        className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                          selectedCategory === cat
                            ? "text-blue-600 font-medium bg-gray-50"
                            : "text-gray-700"
                        }`}
                      >
                        {label}
                        {selectedCategory === cat && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </li>
                    )
                  })}
                </ul>
              </div>
            )}
          </div>

          {/* 🎯 Difficulty Dropdown */}
          <div className="relative">
            <button
              onClick={() => setOpenDifficulty(!openDifficulty)}
              className="flex items-center justify-between w-56 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                {selectedDifficulty}
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  openDifficulty ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDifficulty && (
              <div className="absolute mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <ul className="py-1">
                  {difficulties.map((level) => (
                    <li
                      key={level}
                      onClick={() => {
                        setSelectedDifficulty(level)
                        setOpenDifficulty(false)
                      }}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                        selectedDifficulty === level
                          ? "text-blue-600 font-medium bg-gray-50"
                          : "text-gray-700"
                      }`}
                    >
                      {level}
                      {selectedDifficulty === level && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
