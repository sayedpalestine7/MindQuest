import ProfileImageUpload from "../../signUp/ProfileImageUpload.jsx"

export default function EditProfileDialog({ open, onClose, profileData, setProfileData }) {
  if (!open) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfileData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size too large! Please select an image smaller than 5MB.")
        return
      }
      const reader = new FileReader()
      reader.onload = (ev) => setProfileData({ ...profileData, avatar: ev.target.result })
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setProfileData({ ...profileData, avatar: "" })
  }

  const handleSave = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-5">
        <h3 className="text-2xl font-bold">Edit Profile</h3>

        <ProfileImageUpload
          imagePreview={profileData?.avatar}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          isLoading={false}
        />

        <div className="space-y-3">
          <input
            className="w-full border rounded-md px-3 py-2"
            name="name"
            value={profileData?.name || ""}
            onChange={handleChange}
            placeholder="Full Name"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            type="email"
            name="email"
            value={profileData?.email || ""}
            onChange={handleChange}
            placeholder="Email"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            name="specialization"
            value={profileData?.specialization || ""}
            onChange={handleChange}
            placeholder="Specialization (e.g. AI, Web Dev)"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            type="number"
            name="experience"
            value={profileData?.experience || ""}
            onChange={handleChange}
            placeholder="Years of Experience"
          />
          <textarea
            className="w-full border rounded-md px-3 py-2"
            name="bio"
            value={profileData?.bio || ""}
            onChange={handleChange}
            placeholder="Short Bio"
            rows={3}
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            name="phone"
            value={profileData?.phone || ""}
            onChange={handleChange}
            placeholder="Phone Number"
          />
          <input
            className="w-full border rounded-md px-3 py-2"
            name="linkedin"
            value={profileData?.linkedin || ""}
            onChange={handleChange}
            placeholder="LinkedIn URL"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button onClick={onClose} className="flex-1 border py-2 rounded-md hover:bg-gray-100">
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
