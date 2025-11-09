import ProfileImageUpload from '../../signUp/ProfileImageUpload.jsx'
import { motion } from 'framer-motion'
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";

export default function EditProfileModal({profileData , editForm, setEditForm, onCancel, onSave }) {
  
  const [form, setForm] = useState(profileData || {});
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };


  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large! Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setForm((prev) => ({ ...prev, profileImage: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, profileImage: "" }));
  };

    const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/student/id/${form._id}`,
        form
      );
      setProfileData(data);
      toast.success("Profile updated successfully ✅");
      onClose();
    } catch (err) {
      console.error("❌ Update error:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
            className="fixed inset-0 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        >
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-5">
        <h3 className="text-2xl font-bold">Edit Profile</h3>

          <ProfileImageUpload
            imagePreview={form.profileImage}
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
    </motion.div>
  )
}