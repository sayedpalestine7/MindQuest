// src/pages/admin/teacher-verification/ConfirmDialog.jsx
import React from "react"

export default function ConfirmDialog({ teacher, action, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-bold mb-3">
          {action === "approve" ? "Approve Teacher" : "Reject Application"}
        </h3>
        <p className="text-gray-600 mb-6">
          {action === "approve"
            ? `Are you sure you want to approve ${teacher.name}?`
            : `Are you sure you want to reject ${teacher.name}'s application?`}
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
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
