import ProfileImageUpload from '../../signUp/ProfileImageUpload.jsx'

export default function EditProfileModal({ editForm, setEditForm, onCancel, onSave }) {
  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large! Please select an image smaller than 5MB.")
        return
      }
      
      const reader = new FileReader()
      reader.onload = (ev) => setEditForm({ ...editForm, avatar: ev.target.result })
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setEditForm({ ...editForm, avatar: "" })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-5">
        <h3 className="text-2xl font-bold">Edit Profile</h3>

        <ProfileImageUpload 
          imagePreview={editForm.avatar}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          isLoading={false}
        />

        <div className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Full Name"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            type="email"
            value={editForm.email}
            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
            placeholder="Email"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            type="password"
            value={editForm.password}
            onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
            placeholder="New Password"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onCancel} className="flex-1 border py-2 rounded-md hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={onSave} className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}