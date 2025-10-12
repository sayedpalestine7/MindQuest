export function UserRow({ user, onView, onBan }) {
    if (!user) return null; // ⛔ Skip rendering if user is undefined

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <>
      <td className="p-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </td>
      <td className="p-2 font-medium">{user.name}</td>
      <td className="p-2 text-gray-600">{user.email}</td>
      <td className="p-2 capitalize">{user.userType}</td>
      <td className="p-2 text-center">{user.points}</td>
      <td className="p-2">
        <span
          className={`px-2 py-1 text-xs rounded ${
            user.status === "active" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="p-2 text-right space-x-2">
        <button onClick={onView} className="text-blue-500 hover:underline">View</button>
        <button onClick={onBan} className="text-red-500 hover:underline">
          {user.status === "banned" ? "Unban" : "Ban"}
        </button>
      </td>
    </>
  )
}
