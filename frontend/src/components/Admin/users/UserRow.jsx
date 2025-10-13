import {GraduationCap ,BookOpen ,CheckCircle ,XCircle ,Eye ,Ban} from 'lucide-react'
export function UserRow({ user, onView, onBan }) {
    if (!user) return null; // ⛔ Skip rendering if user is undefined

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()

  return (
    <>
    {/* Avatar */}
      <td className="p-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full" />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </td>
      {/* Name */}
      <td className="p-2 font-medium text-white">{user.name}</td>
      {/* Email */}
      <td className="p-2 text-gray-500 flex justify-start ">{user.email}</td>
      {/* User Type	 */}
      <td className="p-2 capitalize">
          {user.userType=== "teacher"?(
            <span className="gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-400 flex justify-center items-center border"> <GraduationCap className="h-3.5 w-3.5"/>Teacher</span>
          ):(
            <span className="gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-400 flex justify-center items-center border"> <BookOpen className="h-3.5 w-3.5" />Student</span>
          )}
      </td>
      {/* Points */}
      <td className="p-2 text-center"><span className='gap-1.5 border-blue-500/50 bg-blue-500/10 text-blue-400 flex justify-center items-center border'>{user.points}</span></td>
      {/* Status */}
      <td className="p-2">
        <span
          className={`px-2 py-1 text-xs rounded flex justify-center items-center ${
            user.status === "active" ? "bg-blue-500 text-white" : "bg-red-600 text-white"
          }`}
        >
          {user.status === "active" ? <CheckCircle className="h-3 w-3"/> :<XCircle className="h-3 w-3" /> }
         
          {user.status}
        </span>
      </td>
      {/* Actions */}
      <td className="p-2 text-right space-x-2 flex justify-end">
        <button onClick={onView} className="bg-blue-500 px-2 text-white rounded hover:bg-blue-700 flex justify-center items-center"><Eye className="h-4 w-4" />View</button>
        <button onClick={onBan} className="bg-red-500 px-2 text-white rounded hover:bg-red-700 flex justify-center items-center">
          <Ban className="h-4 w-4" />{user.status === "banned" ? "Unban" : "Ban"}
        </button>
      </td>
    </>
  )
}
