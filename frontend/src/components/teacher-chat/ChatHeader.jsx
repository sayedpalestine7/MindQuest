import { useState } from "react";
import { motion } from "framer-motion";

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
      className="flex items-center gap-3 p-3 border-b border-slate-200 bg-gradient-to-b from-slate-50 to-white"
    >
      {/* Avatar */}
      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center">
        {hasImage ? (
          <img
            src={student.avatar}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-white font-bold text-sm">{name.charAt(0)}</span>
        )}
      </div>

      {/* Name and Status */}
      <div>
        <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
        <p className="text-xs text-slate-600">{subject || "Student"}</p>
      </div>
    </motion.div>
  );
}
