export function FilterBar({ userTypeFilter, setUserTypeFilter, statusFilter, setStatusFilter }) {
  const btn = "px-3 py-1 border rounded text-sm"
  const active = "bg-blue-500 text-white"

  return (
    <div className="flex flex-wrap gap-4 mt-4">
      <div>
        <span className="font-semibold mr-2">User Type:</span>
        <button onClick={() => setUserTypeFilter("all")} className={`${btn} ${userTypeFilter === "all" ? active : ""}`}>All</button>
        <button onClick={() => setUserTypeFilter("teacher")} className={`${btn} ${userTypeFilter === "teacher" ? active : ""}`}>Teacher</button>
        <button onClick={() => setUserTypeFilter("student")} className={`${btn} ${userTypeFilter === "student" ? active : ""}`}>Student</button>
      </div>

      <div>
        <span className="font-semibold mr-2">Status:</span>
        <button onClick={() => setStatusFilter("all")} className={`${btn} ${statusFilter === "all" ? active : ""}`}>All</button>
        <button onClick={() => setStatusFilter("active")} className={`${btn} ${statusFilter === "active" ? active : ""}`}>Active</button>
        <button onClick={() => setStatusFilter("banned")} className={`${btn} ${statusFilter === "banned" ? active : ""}`}>Banned</button>
      </div>
    </div>
  )
}
