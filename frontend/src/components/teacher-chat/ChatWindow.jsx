import React from "react";
import { motion } from "framer-motion";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

export default function ChatWindow({ messages, onSend, selectedStudent }) {
  if (!selectedStudent) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-indigo-50"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No conversation selected</p>
          <p className="text-gray-500">Select a student from the list to start chatting</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full bg-white"
    >
      {/* Chat Header */}
      <ChatHeader student={selectedStudent} />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3">
        <ChatMessages messages={messages} />
      </div>

      {/* Message Input */}
      <MessageInput onSend={onSend} />
    </motion.div>
  );
}
