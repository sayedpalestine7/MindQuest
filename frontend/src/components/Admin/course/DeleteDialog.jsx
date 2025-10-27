

export default function DeleteDialog({ course, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 text-wh rounded-lg p-6 w-full max-w-md text-center">
        <h3 className="text-xl font-bold mb-3 text-white">Delete Course</h3>
        <p className="text-gray-400 mb-6">
          Are you sure you want to delete <strong>"{course.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200">Cancel</button>
          <button
            onClick={() => onConfirm(course.id)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
