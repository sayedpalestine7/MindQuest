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

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  // ---------------- FETCH TEACHER PROFILE ----------------
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

  // ---------------- FETCH STUDENTS ----------------
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

  // ---------------- CHAT SOCKET & ROOM ----------------
  useEffect(() => {
    if (!selectedStudent || !teacherId || !socket) return;

    const studentId = selectedStudent._id || selectedStudent.id;
    const roomId = `${teacherId}_${studentId}`;

    console.log("Trying to join room:", roomId, "TeacherID:", teacherId, "StudentID:", studentId);

    setMessages([]); // clear previous

    // Join room
    socket.emit("join_room", { teacherId, studentId });


    // Load previous messages
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

    // Listen for real-time messages
    const handleNewMessage = (msg) => {
      const msgTeacherId = msg.teacher || msg.teacherId;
      const msgStudentId = msg.student || msg.studentId;

      if (msgTeacherId === teacherId && msgStudentId === studentId) {
        setMessages((prev) => [
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
        ]);
      }
    };

    socket.off("new_message", handleNewMessage);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.emit("leave_room", { roomId, teacherId, studentId });
      socket.off("new_message", handleNewMessage);
    };
  }, [selectedStudent, teacherId]);

  // ---------------- SEND MESSAGE ----------------
const handleSendMessage = async (text) => {
  if (!text.trim() || !selectedStudent || !teacherId || !socket) return;

  const studentId = selectedStudent._id || selectedStudent.id;
  const roomId = `${teacherId}_${studentId}`;

  const messagePayload = {
    content: text,
    sender: "teacher",
    teacherId: teacherId,
    studentId: studentId,
  };

  // Transform to backend expected keys
  const backendPayload = {
    content: messagePayload.content,
    sender: messagePayload.sender,
    teacher: messagePayload.teacherId,
    student: messagePayload.studentId,
  };

  try {
    const token = localStorage.getItem("token");

    await axios.post("http://localhost:5000/api/chat/send", backendPayload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to send message");
  }

  socket.emit("send_message", messagePayload);


  // setMessages((prev) => [
  //   ...prev,
  //   {
  //     id: `${Date.now()}-${Math.random()}`,
  //     sender: messagePayload.sender,
  //     content: messagePayload.content,
  //     timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  //   },
  // ]);
};



  // ---------------- SEARCH STUDENTS ----------------
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

  // ---------------- LOGOUT ----------------
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
        <Header onLogout={handleLogout} />
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditOpen(true)} />
          <PerformanceSection stats={stats} />
          <StatsSection stats={stats} />
          <CoursesSection courses={profileData.courses ?? []} />
        </div>

        {/* CHAT BUTTON */}
        <motion.button
          onClick={() => setIsChatOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
        >
          💬 Messages
        </motion.button>

        {/* CHAT MODAL */}
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
                />
                <div className="flex-1 border-l">
                  <ChatWindow
                    messages={messages}
                    onSend={handleSendMessage}
                    selectedStudent={selectedStudent}
                  />
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}></div>
          </div>
        )}

        {isEditOpen && (
          <EditProfileDialog profileData={profileData} onClose={() => setIsEditOpen(false)} setProfileData={setProfileData} />
        )}
      </motion.div>
    </div>
  );
}
