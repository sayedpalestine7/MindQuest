import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

/**
 * ChatMessages - Displays chat messages with reverse infinite scroll support
 * 
 * Props:
 *   - messages: Array of message objects
 *   - onLoadMore: Callback to fetch older messages (triggered on scroll to top)
 *   - hasMore: Boolean indicating if more messages are available
 *   - isLoadingMore: Boolean indicating if older messages are being fetched
 *   - isInitialLoad: Boolean to control auto-scroll behavior
 */
export default function ChatMessages({ 
  messages, 
  onLoadMore, 
  hasMore = false, 
  isLoadingMore = false,
  isInitialLoad = false 
}) {
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const previousScrollHeightRef = useRef(0);
  const isUserScrolledUpRef = useRef(false);

  // Auto-scroll to bottom on initial load
  useEffect(() => {
    if (isInitialLoad && messages.length > 0) {
      // Initial load: scroll to bottom immediately and after render
      const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: "instant" });
        }
        // Also force scroll using scrollTop for reliability
        if (messagesContainerRef.current) {
          messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
        }
      };
      
      scrollToBottom();
      // Scroll after delays to handle rendering and tab animations (300ms)
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 350);
      setTimeout(scrollToBottom, 500);
    }
  }, [isInitialLoad, messages.length]);

  // Preserve scroll position when older messages are prepended
  useEffect(() => {
    if (isLoadingMore || messages.length === 0) return;

    const container = messagesContainerRef.current;
    if (!container) return;

    // After older messages are loaded, restore scroll position
    if (previousScrollHeightRef.current > 0) {
      const newScrollHeight = container.scrollHeight;
      const heightDifference = newScrollHeight - previousScrollHeightRef.current;
      
      // Maintain scroll position by adding the height difference
      container.scrollTop += heightDifference;
      previousScrollHeightRef.current = 0;
    }
  }, [messages.length, isLoadingMore]);

  // Detect scroll to top and trigger load more
  const handleScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop } = container;
    
    // User scrolled up from bottom
    isUserScrolledUpRef.current = scrollTop < container.scrollHeight - container.clientHeight - 50;

    // If scrolled near the top and more messages available
    if (scrollTop < 100 && hasMore && !isLoadingMore) {
      // Store current scroll height before loading
      previousScrollHeightRef.current = container.scrollHeight;
      onLoadMore?.();
    }
  };

  // Scroll to bottom only for new real-time messages when user is at bottom
  useEffect(() => {
    if (!isInitialLoad && !isLoadingMore && messages.length > 0) {
      // Only auto-scroll if user hasn't scrolled up
      if (!isUserScrolledUpRef.current) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages, isLoadingMore, isInitialLoad]);

  if (messages.length === 0 && !isLoadingMore) {
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
    <div 
      ref={messagesContainerRef}
      onScroll={handleScroll}
      className="flex flex-col gap-3 overflow-y-auto h-full"
    >
      {/* Loading indicator for older messages */}
      {isLoadingMore && (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Messages list */}
      {messages.map((msg, idx) => (
        <motion.div
          key={msg.id || msg._id || idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(idx * 0.03, 0.3) }}
          className={`flex ${msg.sender === "teacher" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-xs px-3 py-2 rounded-2xl shadow-sm ${
              msg.sender === "teacher"
                ? "bg-gradient-to-r from-blue-700 to-blue-700 text-white rounded-br-none"
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
