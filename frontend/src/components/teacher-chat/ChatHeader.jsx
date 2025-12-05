import { useState } from "react";

export default function ChatHeader({ student }) {
  if (!student) return null;

  const [imgError, setImgError] = useState(false);
  const name = student.name || "Unknown";
  const subject = student.subject || "";
  const hasImage = student.avatar && !imgError;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="relative w-10 h-10">
          {/* Avatar container */}
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">

            {/* Show image only if available AND not broken */}
            {hasImage && (
              <img
                src={student.avatar}
                alt={name}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}

            {/* Fallback initials only if no image */}
            {!hasImage && (
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold">{name}</div>
          <div className="text-sm text-gray-500">{subject}</div>
        </div>
      </div>
    </div>
  );
}
