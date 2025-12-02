import React from "react";

export default function ChatHeader({ teacher }) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-100">
      <div className="flex items-center gap-3">
        {/* Avatar with fallback */}
        <div className="relative w-10 h-10">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {teacher.avatar ? (
              <img 
                src={teacher.avatar} 
                alt={teacher.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Hide image on error
                  e.target.style.display = 'none';
                }}
              />
            ) : null}
            
            {/* Fallback initials - always visible if no avatar or on error */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
              {teacher.name.charAt(0)}
            </div>
          </div>
        </div>
        
        <div>
          <div className="font-semibold">{teacher.name}</div>
          <div className="text-sm text-gray-500">{teacher.subject}</div>
        </div>
      </div>
    </div>
  );
}