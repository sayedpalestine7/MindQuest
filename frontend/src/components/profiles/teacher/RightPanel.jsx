import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CoursesSection from "./CoursesSection";
import StudentSidebar from "../../teacher-chat/StudentSidebar";
import ChatWindow from "../../teacher-chat/ChatWindow";

/**
 * RightPanel - Tabbed interaction area
 * Manages tabs for Courses and Chat with independent state
 */
export default function RightPanel({
  // Courses tab props
  courses,
  activeCourseId,
  onCourseSelect,
  onCourseUpdate,
  onCourseDelete,
  
  // Chat tab props
  students,
  selectedStudent,
  onSelectStudent,
  messages,
  onSendMessage,
  studentSearch,
  onSearchStudents,
  socket,
  teacherId,
  unreadCount,
  setUnreadCount,
  
  // Pagination props
  onLoadMoreMessages,
  hasMoreMessages,
  isLoadingMoreMessages,
  isInitialLoad,
}) {
  const [activeTab, setActiveTab] = useState("courses");

  // Calculate total unread messages
  const totalUnread = Object.values(unreadCount || {}).reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Tab Navigation */}
      <div className="flex bg-white sticky top-0 z-20 border-b-2 border-slate-200">
        <button
          onClick={() => setActiveTab("courses")}
          className={`flex-1 py-4 px-6 font-semibold transition-all border-b-2 ${
            activeTab === "courses"
              ? "border-blue-600 text-blue-600 bg-slate-50"
              : "border-transparent text-slate-500"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            Courses
          </span>
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-4 px-6 font-semibold transition-all relative border-b-2 ${
            activeTab === "chat"
              ? "border-blue-600 text-blue-600 bg-slate-50"
              : "border-transparent text-slate-500"
          }`}
        >
          <span className="flex items-center justify-center gap-2">
            Chat
            {/* {totalUnread > 0 && (
              <span className="text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ backgroundColor: "#E53935" }}>
                {totalUnread}
              </span>
            )} */}
          </span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === "courses" && (
            <motion.div
              key="courses"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="h-full min-h-0 overflow-y-auto overscroll-contain "
            >
              <CoursesSection 
                courses={courses} 
                activeCourseId={activeCourseId}
                onCourseSelect={onCourseSelect}
                onCourseUpdate={onCourseUpdate}
                onCourseDelete={onCourseDelete}
              />
            </motion.div>
          )}

          {activeTab === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full min-h-0 flex"
            >
              {/* Chat Interface */}
              <div className="flex-shrink-0 border-r border-slate-200 min-h-0">
                <StudentSidebar
                  students={students}
                  selectedStudent={selectedStudent}
                  onSelectStudent={onSelectStudent}
                  searchValue={studentSearch}
                  onSearch={onSearchStudents}
                  socket={socket}
                  teacherId={teacherId}
                  unreadCount={unreadCount}
                  setUnreadCount={setUnreadCount}
                />
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col bg-white">
                {selectedStudent ? (
                  <ChatWindow
                    messages={messages}
                    onSend={onSendMessage}
                    selectedStudent={selectedStudent}
                    onLoadMore={onLoadMoreMessages}
                    hasMore={hasMoreMessages}
                    isLoadingMore={isLoadingMoreMessages}
                    isInitialLoad={isInitialLoad}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 bg-gradient-to-br from-slate-50 to-white">
                    <div className="text-center">
                      <p className="text-lg">Select a student to start chatting</p>
                      <p className="text-sm mt-2">Choose from the list on the left</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
