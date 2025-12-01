import React from "react";

export default function ChatHeader({ teacher }) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-gray-100">
      <div className="flex items-center gap-3">
        {teacher.avatar && <img src={teacher.avatar} alt="avatar" className="w-10 h-10 rounded-full" />}
        <div>
          <div className="font-semibold">{teacher.name}</div>
          <div className="text-sm text-gray-500">{teacher.subject}</div>
        </div>
      </div>
    </div>
  );
}
