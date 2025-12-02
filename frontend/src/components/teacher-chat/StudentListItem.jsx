"use client";

import React from "react";

export default function StudentListItem({ student, isSelected, onSelect, }) {
  return (
    <button
      className={`p-4 border-b cursor-pointer transition-colors
        ${isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"}`
      }
      onClick={onSelect}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="avatar">
          <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
            {student.avatar ? (
              <img
                src={student.avatar}
                alt={student.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-semibold">
                {student.name?.charAt(0) || "T"}
              </div>
            )}
          </div>
        </div>

        {/* Student Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{student.name}</h3>
          <p className="text-sm text-gray-600 truncate">{student.subject || "Student"}</p>

          {/* Unread indicator (example) */}
          {student.unreadCount > 0 && (
            <div className="inline-flex items-center mt-1">
              <span className="w-2 h-2 rounded-full bg-red-500 mr-1"></span>
              <span className="text-xs text-red-600 font-medium">
                {student.unreadCount} unread
              </span>
            </div>
          )}
        </div>
        {/* Selection indicator */}
        {isSelected && (
          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
        )}
      </div>
    </button>
  )
}