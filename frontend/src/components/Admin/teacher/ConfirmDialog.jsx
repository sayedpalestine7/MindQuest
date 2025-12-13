// src/pages/admin/teacher-verification/ConfirmDialog.jsx
import React, { useState } from "react"

export default function ConfirmDialog({ teacher, action, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");

  const handleConfirmClick = () => {
    if (action === "reject") {
      onConfirm(reason);
    } else {
      onConfirm();
    }
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-wh rounded-lg p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-bold mb-3 text-white">
          {action === "approve" ? "Approve Teacher" : "Reject Application"}
        </h3>
        <p className="text-gray-400 mb-6">
          {action === "approve"
            ? `Are you sure you want to approve ${teacher.name}?`
            : `Are you sure you want to reject ${teacher.name}'s application?`}
        </p>

        {action === "reject" && (
          <div className="mb-4 text-left">
            <label className="block text-sm text-gray-300 mb-1">
              Rejection reason
            </label>
            <textarea
              className="w-full rounded border border-gray-700 bg-gray-800 text-white px-3 py-2 text-sm resize-y min-h-[80px]"
              placeholder="E.g. Certification not clear, invalid institution, incomplete information..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirmClick}
            className={`px-4 py-2 rounded text-white ${
              action === "approve" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {action === "approve" ? "Approve" : "Reject"}
          </button>
        </div>
      </div>
    </div>
  )
}
