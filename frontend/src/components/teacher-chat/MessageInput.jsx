import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Paperclip, Smile } from "lucide-react";

export default function MessageInput({ onSend }) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <motion.div 
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`flex gap-3 p-4 bg-white border-t transition-all duration-200 ${
        isFocused ? "shadow-lg" : ""
      }`}
    >
      {/* Attachment & Emoji Buttons */}
      <div className="flex gap-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition"
        >
          <Paperclip className="w-5 h-5" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition"
        >
          <Smile className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Input Field */}
      <div className="flex-1 relative">
        <textarea
          type="text"
          placeholder="Type your message... (Shift+Enter for new line)"
          className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-24"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows="1"
        />
      </div>

      {/* Send Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!text.trim()}
        className={`px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2 ${
          text.trim()
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-lg"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
