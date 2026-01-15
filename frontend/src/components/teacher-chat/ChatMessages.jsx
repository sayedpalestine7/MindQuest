import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-center">
        <div>
          <p className="text-slate-500 text-lg">No messages yet</p>
          <p className="text-slate-400 text-sm">Start the conversation by sending a message</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg, idx) => (
        <motion.div
          key={msg.id || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
          className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-3 py-2 rounded-2xl shadow-sm ${
              msg.sender === "teacher"
                ? "bg-gradient-to-r from-indigo-700 to-violet-700 text-white rounded-br-none"
                : "bg-slate-200 text-slate-900 rounded-bl-none"
            }`}
          >
            <p className="break-words">{msg.content}</p>
            <div
              className={`flex items-center justify-end gap-1 mt-2 text-xs ${
                msg.sender === "teacher" ? "text-white/80" : "text-slate-500"
              }`}
            >
              <span>{msg.timestamp}</span>
            </div>
          </div>
        </motion.div>
      ))}

      <div ref={messagesEndRef}></div>
    </div>
  );
}
