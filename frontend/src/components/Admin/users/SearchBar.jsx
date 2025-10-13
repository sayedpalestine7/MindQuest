export function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full border border-gray-700 rounded px-4 py-2 pl-9 bg-gray-900 text-gray-100"
      />
    </div>
  )
}
