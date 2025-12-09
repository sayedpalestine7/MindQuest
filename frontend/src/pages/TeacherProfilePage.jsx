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
        const res = await axios.get(`http://localhost:5000/api/teacher/id/${teacherId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [teacherId]);

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
  // ------------- Fetch unread counts once and update live -------------
  useEffect(() => {
    if (!teacherId) return;

    const fetchUnread = async () => {
      const res = await axios.get(`http://localhost:5000/api/chat/unread/${teacherId}`);

      const map = {};
      res.data.forEach((item) => (map[item._id] = item.count));

      setUnreadCount(map);
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
    rating: profileData.rating?.toFixed(1) ?? "0.0",
    totalPoints: profileData.totalPoints ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Header onLogout={handleLogout} teacherId={teacherId} />
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditOpen(true)} />
          <PerformanceSection stats={stats} />
          <StatsSection stats={stats} />
          <CoursesSection courses={profileData.courses ?? []} />
        </div>

        {/* Chat Button */}
        <motion.button
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
          💬 Messages
        </motion.button>

        {/* Chat Modal */}
        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 w-[90vw] max-w-3xl h-[80vh] flex flex-col">
              <div className="p-4 border-b bg-gray-100 flex justify-between items-center">
                <h3 className="font-semibold text-lg">Teacher Messaging Center</h3>
                <button className="btn btn-sm btn-error" onClick={() => setIsChatOpen(false)}>Close</button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <StudentSidebar
                  students={filteredStudents}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent}
                  searchValue={studentSearch}
                  onSearch={handleSearchStudents}
                  socket={socket}         // ⬅ ADD THIS
                  teacherId={teacherId}   // ⬅ ADD THIS
                  unreadCount={unreadCount}          // 🟢 fix #1
                  setUnreadCount={setUnreadCount}    // 🟢 fix #2
                />
                <div className="flex-1 border-l">
                  <ChatWindow messages={messages} onSend={handleSendMessage} selectedStudent={selectedStudent} />
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}></div>
          </div>
        )}

        {isEditOpen && (
          <EditProfileDialog
            open={isEditOpen}
            profileData={profileData}
            onClose={() => setIsEditOpen(false)}
            setProfileData={setProfileData} />
        )}
      </motion.div>
    </div>
  );
}
