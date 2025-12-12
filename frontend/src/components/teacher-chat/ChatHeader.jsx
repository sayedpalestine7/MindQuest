import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Video, Info } from "lucide-react";

export default function ChatHeader({ student }) {
  if (!student) return null;

  const [imgError, setImgError] = useState(false);
  const name = student.name || "Unknown";
  const subject = student.subject || "";
  const hasImage = student.avatar && !imgError;

  return (
    <motion.div 
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50 shadow-sm"
    >
      <div className="flex items-center gap-4">
        {/* Status Indicator + Avatar */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center ring-2 ring-blue-200">
            {hasImage ? (
              <img
                src={student.avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
        </div>

        {/* Name and Status */}
        <div>
          <h3 className="font-bold text-gray-800 text-lg">{name}</h3>
          <p className="text-sm text-gray-600">{subject || "Student"}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white rounded-lg transition text-gray-600 hover:text-blue-600"
        >
          <Phone className="w-5 h-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white rounded-lg transition text-gray-600 hover:text-blue-600"
        >
          <Video className="w-5 h-5" />
        </motion.button>
        <motion.button 
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-white rounded-lg transition text-gray-600 hover:text-blue-600"
        >
          <Info className="w-5 h-5" />
        </motion.button>
      </div>
    </motion.div>
  );
}
