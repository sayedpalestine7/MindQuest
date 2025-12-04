import React, { useEffect, useRef } from "react";

export default function ChatMessages({ messages }) {
  const messagesEndRef = useRef(null); 

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col gap-2">
      {messages.map((msg) => (
        <div
          key={msg._id}
          className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-3 py-2 rounded-lg ${msg.sender === "teacher" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"
              }`}
          >
            {msg.content}
            <div className="text-xs text-gray-400 mt-1 text-right">{msg.timestamp}</div>
          </div>
        </div>
      ))}

      <div ref={messagesEndRef}></div>
    </div>
    
  );
}
