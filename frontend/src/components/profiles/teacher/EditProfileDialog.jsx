"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import ProfileImageUpload from "../../signUp/ProfileImageUpload"

export default function EditProfileDialog({ open, onClose }) {
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // handle selecting an image
  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result)
      reader.readAsDataURL(file)
    } else {
      alert("Image must be smaller than 5MB.")
    }
  }

  // handle removing an image
  const removeImage = () => setImagePreview(null)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex justify-center items-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md relative"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              onClick={onClose}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold mb-4 text-gray-800 text-center">
              Edit Profile
            </h2>

            {/* 🖼️ Profile image upload section */}
            <ProfileImageUpload
              imagePreview={imagePreview}
              handleImageChange={handleImageChange}
              removeImage={removeImage}
              isLoading={isLoading}
            />

            {/* 📝 Edit profile form */}
            <form className="space-y-4 mt-6">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
              />
              <input
                type="text"
                placeholder="Specialization"
                className="w-full border border-gray-300 rounded-lg p-2 focus:ring focus:ring-blue-300"
              />
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
              >
                Save Changes
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
