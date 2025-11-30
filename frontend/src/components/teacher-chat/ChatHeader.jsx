export default function ChatHeader({ student }) {
  if (!student) return null

  return (
    <div className="p-4 border-b bg-base-200 flex items-center justify-between">
      <div className="flex items-center gap-3">

        <div className="avatar">
          <div className="w-10 rounded-full">
            <img src={student.avatar} />
          </div>
        </div>

        <div>
          <p className="font-semibold">{student.name}</p>
          <p className="text-xs flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${student.status === "online" ? "bg-green-500" : "bg-gray-400"}`} />
            {student.status === "online" ? "Active now" : "Offline"}
          </p>
        </div>
      </div>

      <div className="badge badge-outline text-xs">{student.course}</div>
    </div>
  )
}
