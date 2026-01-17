import axios from "axios";
import ProfileImageUpload from "../../signUp/ProfileImageUpload.jsx";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function EditProfileDialog({ open, onClose, profileData, setProfileData }) {
  if (!open) return null;

  // Parse links from string to array
  const initialLinks = profileData?.link 
    ? String(profileData.link).split(/[,\s]+/).map(l => l.trim()).filter(Boolean)
    : [""];

  // Parse specializations from string to array
  const initialSpecializations = profileData?.specialization
    ? String(profileData.specialization).split(/[,\s]+/).map(s => s.trim()).filter(Boolean)
    : [""];

  const [form, setForm] = useState(profileData || {});
  const [links, setLinks] = useState(initialLinks);
  const [specializations, setSpecializations] = useState(initialSpecializations);
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

  const handleAddLink = () => {
    setLinks([...links, ""]);
  };

  const handleRemoveLink = (index) => {
    if (links.length === 1) {
      setLinks([""]);
    } else {
      setLinks(links.filter((_, i) => i !== index));
    }
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...links];
    newLinks[index] = value;
    setLinks(newLinks);
  };

  const handleAddSpecialization = () => {
    setSpecializations([...specializations, ""]);
  };

  const handleRemoveSpecialization = (index) => {
    if (specializations.length === 1) {
      setSpecializations([""]);
    } else {
      setSpecializations(specializations.filter((_, i) => i !== index));
    }
  };

  const handleSpecializationChange = (index, value) => {
    const newSpecializations = [...specializations];
    newSpecializations[index] = value;
    setSpecializations(newSpecializations);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Join non-empty links into a single comma-separated string
      const linkString = links.filter(l => l.trim()).join(", ");
      // Join non-empty specializations into a single comma-separated string
      const specializationString = specializations.filter(s => s.trim()).join(", ");

      const { data } = await axios.put(
        `http://localhost:5000/api/teacher/id/${form._id}`,
        { ...form, link: linkString, specialization: specializationString }
      );

      // Merge the updated data with existing profileData to preserve courses and stats
      setProfileData((prevData) => ({
        ...prevData,
        ...data,
        link: linkString,
        specialization: specializationString,
        // Preserve courses and calculated fields if backend doesn't return them
        courses: data.courses || prevData.courses,
        totalCourses: data.totalCourses || prevData.totalCourses,
        totalEnrolledStudents: data.totalEnrolledStudents || prevData.totalEnrolledStudents,
        rating: data.rating !== undefined ? data.rating : prevData.rating,
        totalPoints: data.totalPoints !== undefined ? data.totalPoints : prevData.totalPoints,
      }));
      
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
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[90vh] flex flex-col">
          <div className="p-6 border-b">
            <h3 className="text-2xl font-bold">Edit Profile</h3>
          </div>

          <div className="overflow-y-auto flex-1 p-6 space-y-5">
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

            {/* Multi-specialization inputs */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Specializations</label>
              {specializations.map((spec, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 border rounded-md px-3 py-2"
                    value={spec}
                    onChange={(e) => handleSpecializationChange(index, e.target.value)}
                    placeholder="e.g., AI, Web Development, Data Science"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveSpecialization(index)}
                    className="p-2 border rounded-md hover:bg-red-50 hover:border-red-300 text-red-600"
                    title="Remove specialization"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddSpecialization}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> Add another specialization
              </button>
            </div>

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

            {/* Multi-link inputs */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Social Links</label>
              {links.map((link, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className="flex-1 border rounded-md px-3 py-2"
                    value={link}
                    onChange={(e) => handleLinkChange(index, e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveLink(index)}
                    className="p-2 border rounded-md hover:bg-red-50 hover:border-red-300 text-red-600"
                    title="Remove link"
                  >
                    <X size={20} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddLink}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> Add another link
              </button>
            </div>
            </div>
          </div>

          <div className="p-6 border-t bg-gray-50">
            <div className="flex gap-3">
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
      </div>
    </motion.div>
  );
}
