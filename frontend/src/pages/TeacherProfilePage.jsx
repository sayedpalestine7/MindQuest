"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

import { socket } from "../utils/socket.js";
import Header from "../components/profiles/teacher/Header";
import ProfileHeader from "../components/profiles/teacher/ProfileHeader";
import StatsSection from "../components/profiles/teacher/StatsSection";
import CoursesSection from "../components/profiles/teacher/CoursesSection";
import PerformanceSection from "../components/profiles/teacher/PerformanceSection";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";
import StudentSidebar from "../components/teacher-chat/StudentSidebar";
import ChatWindow from "../components/teacher-chat/ChatWindow.jsx";

export default function TeacherProfilePage() {
  const teacherId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  /* ====== Profile States ====== */
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  /* ====== Chat States ====== */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState({}); // { studentId: count }

  /* ====== Fetch Profile ====== */
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!teacherId) throw new Error("Login required");
        const token = localStorage.getItem("token");
        
        // Fetch teacher profile
        const res = await axios.get(`http://localhost:5000/api/teacher/id/${teacherId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        
        const teacher = res.data;
        
        // Enrich with calculated stats if not in backend response
        const enrichedData = {
          ...teacher,
          totalCourses: teacher.courses?.length || teacher.totalCourses || 0,
          totalStudents: teacher.totalStudents || 0,
          rating: teacher.rating || 0,
          totalPoints: teacher.totalPoints || 0,
        };
        
        setProfileData(enrichedData);
        setLoading(false);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      }
    };
    fetchProfile();
  }, [teacherId, refreshTrigger]);

  /* ====== Fetch Students ====== */
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users");
        const students = (res.data || []).filter((u) => u.userType === "student");
        setStudentsList(students);
        setFilteredStudents(students);
        if (students.length > 0) setSelectedStudent(students[0]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  /* ====== Chat Socket + Conversation ====== */
  useEffect(() => {
    if (!selectedStudent || !teacherId || !socket) return;

    const studentId = selectedStudent._id || selectedStudent.id;
    const roomId = `${teacherId}_${studentId}`;

    setMessages([]); // Clear old messages

    // Join room
    socket.emit("join_room", { teacherId, studentId });

    // Fetch past conversation
    const fetchConversation = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`
        );
        const msgs = (res.data || []).map((m) => ({
          id: m._id,
          sender: m.sender,
          content: m.content,
          timestamp: new Date(m.createdAt || m.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        setMessages(msgs);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load messages");
      }
    };
    fetchConversation();

    // Listen for incoming messages
    const handleNewMessage = (msg) => {
      const msgTeacherId = msg.teacher || msg.teacherId;
      const msgStudentId = msg.student || msg.studentId;

      // Skip messages sent by this client (optimistic UI)
      if (msg.sender === "teacher" && msgTeacherId === msgTeacherId) return;

      if (msgTeacherId === teacherId && msgStudentId === studentId) {
        setMessages((prev) => {
          if (prev.some(m => m.id === msg._id)) return prev; // prevent duplicates
          return [
            ...prev,
            {
              id: msg._id ?? `${msg.timestamp}-${Math.random()}`,
              sender: msg.sender,
              content: msg.content,
              timestamp: new Date(msg.createdAt || msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ];
        });
      }
    };


    socket.off("new_message", handleNewMessage);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_room", { roomId, teacherId, studentId });
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedStudent, teacherId]);
  // ------------- Refresh profile when page becomes visible (user returns) -------------
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ------------- Fetch unread counts once and update live -------------
  useEffect(() => {
    if (!teacherId) return;

    const fetchUnread = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/chat/teacher/unread/${teacherId}`);
        const map = {};
        res.data.forEach((item) => (map[item._id] = item.count));
        setUnreadCount(map);
      } catch (err) {
        console.error("Failed to fetch unread counts:", err);
      }
    };

    fetchUnread();
  }, [teacherId]);

  /* ====== Send Message ====== */
  const handleSendMessage = (text) => {
    if (!text.trim() || !socket || !selectedStudent) return;

    const studentId = selectedStudent._id || selectedStudent.id;

    // Optimistic UI: add message instantly
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: "teacher",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Emit to socket
    socket.emit("send_message", {
      content: text,
      sender: "teacher",
      teacherId,
      studentId,
    });
  };


  /* ====== Search Students ====== */
  const handleSearchStudents = (value) => {
    setStudentSearch(value);
    const filtered = studentsList.filter(
      (s) =>
        s.name?.toLowerCase().includes(value.toLowerCase()) ||
        (s.subject && s.subject.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredStudents(filtered);
    if (filtered.length > 0) setSelectedStudent(filtered[0]);
  };

  /* ====== Logout ====== */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-gray-500">No teacher found</div>;

  const stats = {
    totalCourses: profileData.totalCourses ?? 0,
    totalStudents: profileData.totalStudents ?? 0,
    rating: Number(profileData.rating) || 0,
    totalPoints: profileData.totalPoints ?? 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Header onLogout={handleLogout} teacherId={teacherId} />
        
        <div className="container mx-auto p-4 sm:p-6 space-y-8 max-w-7xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditOpen(true)} />
          </motion.div>

          {/* Performance and Stats in a Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <PerformanceSection stats={stats} />
            </div>
            <div>
              <StatsSection stats={stats} />
            </div>
          </div>

          {/* Courses Section */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <CoursesSection courses={profileData.courses ?? []} />
          </motion.div>
        </div>

        {/* Chat Button */}
        <motion.button
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-2 font-semibold transition-all duration-200"
        >
          <span className="text-xl">💬</span> Messages
          {Object.values(unreadCount).reduce((a, b) => a + b, 0) > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2">
              {Object.values(unreadCount).reduce((a, b) => a + b, 0)}
            </span>
          )}
        </motion.button>

        {/* Chat Modal */}
        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 w-[90vw] max-w-4xl h-[85vh] flex flex-col rounded-2xl shadow-2xl">
              <div className="p-4 border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white flex justify-between items-center rounded-t-2xl">
                <h3 className="font-bold text-lg">Teacher Messaging Center</h3>
                <button 
                  className="btn btn-sm btn-ghost text-white hover:bg-blue-500" 
                  onClick={() => setIsChatOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <StudentSidebar
                  students={filteredStudents}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                  searchValue={studentSearch}
                  onSearch={handleSearchStudents}
                  socket={socket}
                  teacherId={teacherId}
                  unreadCount={unreadCount}
                  setUnreadCount={setUnreadCount}
                />
                <div className="flex-1 border-l flex flex-col bg-white">
                  <ChatWindow messages={messages} onSend={handleSendMessage} selectedStudent={selectedStudent} />
                </div>
              </div>
            </div>
            <div 
              className="modal-backdrop bg-black/50" 
              onClick={() => setIsChatOpen(false)}
            ></div>
          </div>
        )}

        {isEditOpen && (
          <EditProfileDialog
            open={isEditOpen}
            profileData={profileData}
            onClose={() => setIsEditOpen(false)}
            setProfileData={setProfileData}
          />
        )}
      </motion.div>
    </div>
  );
}
