import { useState, useEffect, useRef } from "react"
import { Search, Filter, TrendingUp, ChevronDown, Check, ArrowUpDown } from "lucide-react"

export default function SearchFilters({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  selectedDifficulty,
  setSelectedDifficulty,
  sortBy,
  setSortBy,
  categories,
}) {
  const [openCategory, setOpenCategory] = useState(false)
  const [openDifficulty, setOpenDifficulty] = useState(false)
  const [openSort, setOpenSort] = useState(false)

  const categoryRef = useRef()
  const difficultyRef = useRef()
  const sortRef = useRef()

  const difficulties = ["All Levels", "Beginner", "Intermediate", "Advanced"]
  const sortOptions = [
    { value: "newest", label: "Newest" },
    { value: "popular", label: "Most Popular" },
    { value: "rating", label: "Highest Rated" },
    { value: "title", label: "A-Z" },
  ]

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (categoryRef.current && !categoryRef.current.contains(e.target)) {
        setOpenCategory(false)
      }
      if (difficultyRef.current && !difficultyRef.current.contains(e.target)) {
        setOpenDifficulty(false)
      }
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setOpenSort(false)
      }
    }

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setOpenCategory(false)
        setOpenDifficulty(false)
        setOpenSort(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleEscape)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses, topics, or skills..."
            className="w-full border border-gray-300 rounded-lg pl-10 h-12 focus:ring-2 focus:ring-blue-400 outline-none"
            aria-label="Search courses"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {/* Category Dropdown */}
          <div ref={categoryRef} className="relative">
            <button
              onClick={() => setOpenCategory(!openCategory)}
              className="flex items-center justify-between w-full sm:w-48 px-3 py-2 h-12 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
              aria-expanded={openCategory}
              aria-haspopup="listbox"
            >
              <div className="flex items-center">
                <Filter className="w-4 h-4 text-gray-500 mr-2" />
                <span className="truncate">
                  {selectedCategory === "all" ? "All Categories" : selectedCategory}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  openCategory ? "rotate-180" : ""
                }`}
              />
            </button>

            {openCategory && (
              <div className="absolute mt-2 w-full sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-64 overflow-y-auto">
                <ul className="py-1" role="listbox">
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
                            ? "text-blue-600 font-medium bg-blue-50"
                            : "text-gray-700"
                        }`}
                        role="option"
                        aria-selected={selectedCategory === cat}
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

          {/* Difficulty Dropdown */}
          <div ref={difficultyRef} className="relative">
            <button
              onClick={() => setOpenDifficulty(!openDifficulty)}
              className="flex items-center justify-between w-full sm:w-48 px-3 py-2 h-12 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
              aria-expanded={openDifficulty}
              aria-haspopup="listbox"
            >
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-gray-500 mr-2" />
                <span className="truncate">{selectedDifficulty}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  openDifficulty ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDifficulty && (
              <div className="absolute mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <ul className="py-1" role="listbox">
                  {difficulties.map((level) => (
                    <li
                      key={level}
                      onClick={() => {
                        setSelectedDifficulty(level)
                        setOpenDifficulty(false)
                      }}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                        selectedDifficulty === level
                          ? "text-blue-600 font-medium bg-blue-50"
                          : "text-gray-700"
                      }`}
                      role="option"
                      aria-selected={selectedDifficulty === level}
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

          {/* Sort Dropdown */}
          <div ref={sortRef} className="relative">
            <button
              onClick={() => setOpenSort(!openSort)}
              className="flex items-center justify-between w-full sm:w-48 px-3 py-2 h-12 border border-gray-300 rounded-lg bg-white text-gray-700 shadow-sm hover:bg-gray-50 transition"
              aria-expanded={openSort}
              aria-haspopup="listbox"
            >
              <div className="flex items-center">
                <ArrowUpDown className="w-4 h-4 text-gray-500 mr-2" />
                <span className="truncate">
                  {sortOptions.find((opt) => opt.value === sortBy)?.label || "Sort"}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                  openSort ? "rotate-180" : ""
                }`}
              />
            </button>

            {openSort && (
              <div className="absolute mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                <ul className="py-1" role="listbox">
                  {sortOptions.map((option) => (
                    <li
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value)
                        setOpenSort(false)
                      }}
                      className={`px-4 py-2 cursor-pointer flex items-center justify-between hover:bg-gray-100 ${
                        sortBy === option.value
                          ? "text-blue-600 font-medium bg-blue-50"
                          : "text-gray-700"
                      }`}
                      role="option"
                      aria-selected={sortBy === option.value}
                    >
                      {option.label}
                      {sortBy === option.value && (
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
