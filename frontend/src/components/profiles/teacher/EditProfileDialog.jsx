import axios from "axios";
import ProfileImageUpload from "../../signUp/ProfileImageUpload.jsx";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";

export default function EditProfileDialog({ open, onClose, profileData, setProfileData }) {
  if (!open) return null;

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
        toast.error("File size too large! Please select an image under 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => setForm((prev) => ({ ...prev, avatar: ev.target.result }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/teacher/id/${form._id}`,
        form
      );

      setProfileData(data);
      toast.success("Profile updated successfully ✅");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update profile ❌");
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
            imagePreview={form.avatar}
            handleImageChange={handleImageChange}
            removeImage={removeImage}
            isLoading={false}
          />

          <div className="space-y-3">
            <input
              className="w-full border rounded-md px-3 py-2"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Full Name"
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Email"
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              name="specialization"
              value={form.specialization || ""}
              onChange={handleChange}
              placeholder="Specialization (e.g. AI, Web Dev)"
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              type="number"
              name="experience"
              value={form.experience || ""}
              onChange={handleChange}
              placeholder="Years of Experience"
            />
            <textarea
              className="w-full border rounded-md px-3 py-2"
              name="bio"
              value={form.bio || ""}
              onChange={handleChange}
              placeholder="Short Bio"
              rows={3}
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              name="phone"
              value={form.phone || ""}
              onChange={handleChange}
              placeholder="Phone Number"
            />
            <input
              className="w-full border rounded-md px-3 py-2"
              name="linkedin"
              value={form.linkedin || ""}
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
              className={`flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 ${
                isSaving ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
