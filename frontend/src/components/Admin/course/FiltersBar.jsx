


export default function FiltersBar({
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  teacherFilter,
  setTeacherFilter,
  categories,
  teachers,
}) {
  return (
    <div className="flex flex-wrap gap-3 ">
      <div className="flex gap-2 ">
        {["all", "published", "draft"].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1 rounded-md border ${
              statusFilter === status ? "bg-blue-500 text-white " : "bg-gray-900 text-white border border-gray-700"
            }`}
          >
            {status[0].toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className=" p-2 rounded-md bg-gray-900 text-white border border-gray-700">
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select value={teacherFilter} onChange={(e) => setTeacherFilter(e.target.value)} className=" p-2 rounded-md bg-gray-900 text-white border border-gray-700">
        <option value="all">All Teachers</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>

      {(statusFilter !== "all" || categoryFilter !== "all" || teacherFilter !== "all") && (
        <button
          onClick={() => {
            setStatusFilter("all")
            setCategoryFilter("all")
            setTeacherFilter("all")
          }}
          className="text-gray-600 underline"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}
