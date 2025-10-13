export function UserProfileDialog({ user, onClose }) {
if (!user) return null
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-2">{user.name}</h2>
        <p className="text-gray-600 mb-4">{user.email}</p>
        <div className="grid grid-cols-2 gap-4">
          <div><strong>Points:</strong> {user.points}</div>
          <div><strong>Courses:</strong> {user.coursesCompleted}</div>
          <div><strong>Quizzes:</strong> {user.quizzesTaken}</div>
          <div><strong>Status:</strong> {user.status}</div>
        </div>
        <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-800 text-white rounded">Close</button>
      </div>
    </div>
  )
}

export default UserProfileDialog