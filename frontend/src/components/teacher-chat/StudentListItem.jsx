export default function StudentListItem({
  student,
  isSelected,
  onSelect,
  onToggleFavorite,
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full p-3 flex items-center gap-3 border-b 
        ${isSelected ? "bg-primary/10" : "hover:bg-base-300"}`
      }
    >
      {/* Avatar */}
      <div className="avatar">
        <div className="w-12 rounded-full">
          <img src={student.avatar} alt={student.name} />
        </div>
      </div>

      <div className="flex-1 text-left">
        <p className="font-semibold">{student.name}</p>
        <p className="text-xs opacity-70">{student.course}</p>
        <p className="text-xs opacity-70 truncate">{student.lastMessage}</p>
      </div>

      {/* Favorite icon */}
      <span
        onClick={(e) => { e.stopPropagation(); onToggleFavorite() }}
        className="cursor-pointer"
      >
        {student.isFavorite ? "❤️" : "🤍"}
      </span>
    </button>
  )
}
