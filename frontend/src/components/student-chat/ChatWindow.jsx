import React from "react";
import ChatHeader from "./ChatHeader";
import ChatMessages from "./ChatMessages";
import MessageInput from "./MessageInput";

export default function ChatWindow({ messages, onSend, selectedTeacher }) {
  if (!selectedTeacher) return <div className="p-4 text-gray-500">Select a teacher to start chatting</div>;

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <ChatHeader teacher={selectedTeacher} />

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <ChatMessages messages={messages} />
      </div>

      {/* Message Input */}
      <div className="border-t p-2 bg-white">
        <MessageInput onSend={onSend} />
      </div>
    </div>
  );
}
