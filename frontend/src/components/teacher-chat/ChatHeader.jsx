export default function ChatHeader({ student }) {
  if (!student) return null;

  const name = student.name || "Unknown"; // fallback if name is undefined
  const subject = student.subject || "";

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-100">
      <div className="flex items-center gap-3">
        {/* Avatar with fallback */}
        <div className="relative w-10 h-10">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : null}

            {/* Fallback initials */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {name.charAt(0)}
            </div>
          </div>
        </div>

        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{subject}</div>
        </div>
      </div>
    </div>
  );
}
