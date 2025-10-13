
export function BanUserDialog({ user, onCancel, onConfirm }) {
if (!user) return null
  const isBanned = user.status === "banned"
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-sm text-center">
        <h3 className="text-lg font-bold mb-2">
          {isBanned ? "Unban User" : "Ban User"}
        </h3>
        <p className="mb-4">
          {isBanned
            ? `Unban ${user.name}? They will regain access.`
            : `Ban ${user.name}? They will lose access.`}
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button
            onClick={onConfirm}
            className={`px-3 py-1 rounded ${isBanned ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      </div>
    </div>
  )
}
export default BanUserDialog
