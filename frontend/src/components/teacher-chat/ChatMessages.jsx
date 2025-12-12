import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Check, CheckCheck, Clock } from "lucide-react";

export default function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-gray-500 text-lg">No messages yet</p>
          <p className="text-gray-400 text-sm">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {messages.map((msg, idx) => (
        <motion.div
          key={msg.id || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
              msg.sender === "teacher"
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-none"
                : "bg-gray-200 text-gray-800 rounded-bl-none"
            }`}
          >
            <p className="break-words">{msg.content}</p>
            <div
              className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                msg.sender === "teacher" ? "text-blue-100" : "text-gray-500"
              }`}
            >
              <span>{msg.timestamp}</span>
              {msg.sender === "teacher" && (
                <CheckCheck className="w-3 h-3" />
              )}
            </div>
          </div>
        </motion.div>
      ))}

      <div ref={messagesEndRef}></div>
    </div>
  );
}
