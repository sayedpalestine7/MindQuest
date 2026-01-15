import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

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
      className="flex gap-3 p-4 bg-white transition-all duration-200"
      style={{ borderTop: '1px solid #E0E0E0' }}
    >
      {/* Input Field */}
      <div className="flex-1 relative">
        <textarea
          type="text"
          placeholder="Type your message... (Shift+Enter for new line)"
          className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 resize-none max-h-24"
          style={{
            borderColor: isFocused ? '#3F51B5' : '#E0E0E0',
            color: '#263238'
          }}
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
        whileHover={{ scale: 1.05, backgroundColor: text.trim() ? '#26A69A' : '#E0E0E0' }}
        whileTap={{ scale: 0.95 }}
        onClick={handleSend}
        disabled={!text.trim()}
        className="px-3 py-2 rounded-xl font-semibold transition flex items-center gap-2"
        style={{
          backgroundColor: text.trim() ? '#3F51B5' : '#E0E0E0',
          color: text.trim() ? '#FFFFFF' : '#607D8B',
          cursor: text.trim() ? 'pointer' : 'not-allowed'
        }}
      >
        <Send className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
