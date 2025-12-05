import React, { useState } from "react";

export default function ChatHeader({ teacher }) {
  const [imgError, setImgError] = useState(false);

  const displayName = teacher?.name || teacher?.fullName || "Unknown";
  const subject = teacher?.subject || "-";

  const hasImage = teacher?.avatar && !imgError;

  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-100">
      <div className="flex items-center gap-3">

        {/* Avatar container */}
        <div className="relative w-10 h-10">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">

            {/* Show avatar only if exists & not broken */}
            {hasImage && (
              <img
                src={teacher.avatar}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            )}

            {/* Show initials only if image missing or broken */}
            {!hasImage && (
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="font-semibold">{displayName}</div>
          <div className="text-sm text-gray-500">{subject}</div>
        </div>
      </div>
    </div>
  );
}
