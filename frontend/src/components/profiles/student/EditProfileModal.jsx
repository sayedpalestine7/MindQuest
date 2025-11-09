import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import ProfileImageUpload from "../../signUp/ProfileImageUpload.jsx";

export default function EditProfileModal({ profileData, onClose, onUpdate }) {
  const [form, setForm] = useState({
    name: profileData.name,
    email: profileData.email,
    password: "",
    profileImage: profileData.avatar
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File too large! Please select an image under 5MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (ev) => {
      setForm((prev) => ({ ...prev, profileImage: ev.target.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setForm((prev) => ({ ...prev, profileImage: "" }));
  };

  const handleSave = async () => {
    // Validation
    if (!form.name || !form.email) {
      toast.error("Name and email are required");
      return;
    }

    setIsSaving(true);
    try {
      const studentId = profileData._id;
      const token = localStorage.getItem("token");

      if (!token) {
        toast.error("Please login again");
        window.location.href = "/login";
        return;
      }

      // Prepare data to send
      const updateData = {
        name: form.name,
        email: form.email,
      };

      // Always include profileImage (even if empty string to delete it)
      updateData.profileImage = form.profileImage || "";

      // Only include password if user entered a new one
      if (form.password && form.password.trim() !== "") {
        updateData.password = form.password;
      }

      console.log("Sending update data:", updateData);

      const response = await axios.put(
        `http://localhost:5000/api/student/id/${studentId}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response from backend:", response.data);

      toast.success("Profile updated successfully ✅");
      
      // Backend returns { message: "...", student: {...} }
      // So we need to pass response.data.student instead of response.data
      onUpdate(response.data.student);
      
      // Close modal
      onClose();
      
    } catch (err) {
      console.error("❌ Update error:", err);
      
      // Handle specific error cases
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Session expired. Please login again");
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/login";
      } else if (err.response?.status === 400) {
        toast.error(err.response?.data?.message || "Invalid data provided");
      } else {
        toast.error(err.response?.data?.message || "Failed to update profile");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 bg-black/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-bold">Edit Profile</h3>

        <ProfileImageUpload
          imagePreview={form.profileImage}
          handleImageChange={handleImageChange}
          removeImage={removeImage}
          isLoading={false}
        />

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              name="name"
              value={form.name || ""}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="email"
              name="email"
              value={form.email || ""}
              onChange={handleChange}
              placeholder="Email"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password (optional)
            </label>
            <input
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              name="password"
              value={form.password || ""}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button 
            onClick={onClose} 
            className="flex-1 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
            disabled={isSaving}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition ${
              isSaving ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </motion.div>
  );
}