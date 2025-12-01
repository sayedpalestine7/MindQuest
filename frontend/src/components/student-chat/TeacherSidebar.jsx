
import TeacherListItem from "./TeacherListItem"

export function TeacherSidebar({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  searchQuery,
  setSearchQuery,
  filter,
  setFilter,
}) {
  return (
    <div className="w-64 border-r bg-base-100 flex flex-col">
      <div className="p-4 space-y-3">
        <input
          type="text"
          placeholder="Search teachers..."
          className="input input-bordered w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "course"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {teachers.length ? (
          teachers.map(teacher => (
            <TeacherListItem
              key={teacher.id}
              teacher={teacher}
              isSelected={selectedTeacher?.id === teacher.id}
              onSelect={() => onSelectTeacher(teacher)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 p-4">No teachers found</p>
        )}
      </div>
    </div>
  )
}
export default TeacherSidebar;