import { useEffect, useState } from "react";

export function BanUserDialog({ user, onCancel, onConfirm }) {
  if (!user) return null;
  const isBanned = user.status === "banned";
  const [reason, setReason] = useState("");

  useEffect(() => {
    setReason("");
  }, [user?.id, isBanned]);

  const canConfirm = isBanned || reason.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-wh rounded-lg p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-bold mb-3 text-white">
          {isBanned ? "Unban User" : "Ban User"}
        </h3>
        <p className="text-gray-400 mb-4">
          {isBanned
            ? `Unban ${user.name}? They will regain access.`
            : `Ban ${user.name}? They will lose access.`}
        </p>

        {!isBanned && (
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Write the reason for banning this user..."
            className="w-full bg-gray-800 text-white border border-gray-700 rounded p-2 mb-4"
            rows={3}
          />
        )}

        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-300">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!canConfirm}
            className={`px-3 py-1 rounded ${isBanned ? "bg-green-600 text-white hover:bg-green-700" : "bg-red-600 text-white hover:bg-red-700"} ${!canConfirm ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isBanned ? "Unban" : "Ban"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default BanUserDialog;
