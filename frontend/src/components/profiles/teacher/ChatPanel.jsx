"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Search } from "lucide-react";

export default function ChatPanel({
  teacherId,
  studentsList,
  selectedStudent,
  onSelectStudent,
  searchValue,
  onSearch,
  messages,
  onSendMessage,
  unreadCount,
  setUnreadCount,
  onClose,
}) {
  const [messageText, setMessageText] = useState("");

  const handleSend = () => {
    if (!messageText.trim()) return;
    onSendMessage(messageText);
    setMessageText("");
  };

  return (
    <>
      {/* Students List */}
      <div className="w-80 border-r border-gray-100 flex flex-col bg-white">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg mb-4">Messages</h3>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchValue}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Students List */}
        <div className="flex-1 overflow-y-auto">
          {studentsList.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">No students found</div>
          ) : (
            studentsList.map((student) => (
              <motion.button
                key={student._id || student.id}
                onClick={() => onSelectStudent(student)}
                whileHover={{ backgroundColor: "#f9fafb" }}
                className={`w-full text-left px-6 py-3 border-b border-gray-50 transition-colors hover:bg-gray-50 ${
                  selectedStudent?._id === student._id || selectedStudent?.id === student.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{student.name}</p>
                    <p className="text-xs text-gray-500 truncate">{student.email}</p>
                  </div>
                  {unreadCount[student._id || student.id] > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {unreadCount[student._id || student.id]}
                    </span>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        {selectedStudent && (
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{selectedStudent.name}</h3>
              <p className="text-xs text-gray-600 mt-1">{selectedStudent.email}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              No messages yet. Start a conversation!
            </div>
          ) : (
            messages.map((msg, i) => (
              <motion.div
                key={msg.id || i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-xs px-4 py-2.5 rounded-xl text-sm ${
                    msg.sender === "teacher"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${msg.sender === "teacher" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Message Input */}
        {selectedStudent && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSend}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm"
              >
                <Send size={18} />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
