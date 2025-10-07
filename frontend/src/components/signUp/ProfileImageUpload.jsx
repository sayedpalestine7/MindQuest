
import { motion } from "framer-motion"

export function ProfileImageUpload({ 
  imagePreview, 
  handleImageChange, 
  removeImage, 
  isLoading 
}) {
  return (
    <div className="space-y-4 text-center">      
      <div className="flex flex-col items-center gap-4">
        <input
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
          disabled={isLoading}
        />
        
        {imagePreview ? (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="relative"
          >
            <img
              src={imagePreview}
              alt="Profile preview"
              className="w-32 h-32 rounded-full object-cover border-4 border-primary shadow-lg"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 bg-error text-error-content rounded-full p-1 hover:scale-110 transition-transform shadow-md"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        ) : (
          <label 
            htmlFor="profileImage" 
            className="w-32 h-32 rounded-full border-4 border-dashed border-base-300 flex items-center justify-center bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
          >
            <div className="flex flex-col items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-base-content/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm text-base-content/60 mt-2">Add Photo</span>
            </div>
          </label>
        )}
        
        <p className="text-xs text-base-content/60">Max size: 5MB • Optional</p>
      </div>
    </div>
  )
}
export default ProfileImageUpload;