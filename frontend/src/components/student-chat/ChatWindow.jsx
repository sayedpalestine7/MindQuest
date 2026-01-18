import React from "react";
import { motion } from "framer-motion";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

export default function ChatWindow({ 
  messages, 
  onSend, 
  selectedTeacher,
  onLoadMore,
  hasMore,
  isLoadingMore,
  isInitialLoad
}) {
  if (!selectedTeacher) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-indigo-50 to-violet-50"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p className="text-xl font-semibold text-slate-800 mb-2">No conversation selected</p>
          <p className="text-slate-500">Select a teacher from the list to start chatting</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-full min-h-0 bg-white"
    >
      {/* Chat Header */}
      <ChatHeader teacher={selectedTeacher} />

      {/* Chat Messages with reverse infinite scroll */}
      <div className="flex-1 min-h-0 overflow-hidden p-3 bg-gradient-to-b from-slate-50 to-white">
        <ChatMessages 
          messages={messages} 
          onLoadMore={onLoadMore}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          isInitialLoad={isInitialLoad}
        />
      </div>

      {/* Message Input */}
      <MessageInput onSend={onSend} />
    </motion.div>
  );
}
