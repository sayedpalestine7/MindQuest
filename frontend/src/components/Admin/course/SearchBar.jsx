export default function SearchBar({ searchQuery, setSearchQuery, sortBy, setSortBy }) {
  return (
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Search courses or teachers..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 border border-gray-700 rounded px-4 py-2 pl-9 bg-gray-900 text-gray-100"
      />
      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border p-2 rounded-md border-gray-700 bg-gray-900 text-gray-100">
        <option value="date">Latest</option>
        <option value="students">Most Students</option>
        <option value="title">Title (A-Z)</option>
      </select>
    </div>
  )
}
