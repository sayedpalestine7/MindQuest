

export default function DeleteDialog({ course, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-2">Delete Course</h3>
        <p className="text-sm text-gray-600 mb-4">
          Are you sure you want to delete <strong>"{course.title}"</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-3 py-1 border rounded hover:bg-gray-100">Cancel</button>
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
