"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

import { socket } from "../utils/socket.js";
import Header from "../components/profiles/student/Header";
import ProfileHeader from "../components/profiles/student/ProfileHeader";
import ProgressOverview from "../components/profiles/student/ProgressOverview";
import EnrolledCourses from "../components/profiles/student/EnrolledCourses";
import EditProfileModal from "../components/profiles/student/EditProfileModal";
import TeacherSidebar from "../components/student-chat/TeacherSidebar";
import ChatWindow from "../components/student-chat/ChatWindow";

export default function StudentProfilePage() {
  /* ================= PROFILE STATES ================= */
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  /* ================= CHAT STATES ================= */
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");

  const studentId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  /* ================= FETCH STUDENT PROFILE ================= */
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !studentId) throw new Error("Login required");

        const res = await axios.get(`http://localhost:5000/api/student/id/${studentId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        setProfileData({
          _id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.profileImage,
          score: data.studentData?.score ?? 0,
          finishedCourses: data.studentData?.finishedCourses ?? 0,
        });
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [studentId]);

  /* ================= FETCH TEACHERS ================= */
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admin/users");
        const teachers = (res.data || []).filter((u) => u.userType === "teacher");
        setTeachersList(teachers);
        setFilteredTeachers(teachers);
        if (teachers.length > 0) setSelectedTeacher(teachers[0]);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch teachers");
      }
    };
    fetchTeachers();
  }, []);

  /* ================= HANDLE TEACHER SELECTION + SOCKET ================= */
  useEffect(() => {
    if (!selectedTeacher || !studentId || !socket) return;

    const teacherId = selectedTeacher._id || selectedTeacher.id;
    const roomId = `${teacherId}_${studentId}`;

    console.log("Trying to join room:", roomId, "TeacherID:", teacherId, "StudentID:", studentId);

    // Clear messages when switching
    setMessages([]);

    // Join room
    socket.emit("join_room", { roomId, teacherId, studentId });

    // Load conversation from backend
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

    // Real-time listener
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
  }, [selectedTeacher, studentId]);

  /* ================= SEND MESSAGE ================= */
const handleSendMessage = async (text) => {
  if (!text.trim() || !selectedTeacher || !studentId || !socket) return;

  const teacherId = selectedTeacher._id || selectedTeacher.id;
  const roomId = `${teacherId}_${studentId}`;

  const messagePayload = {
    content: text,
    sender: "student",
    teacher: teacherId,
    student: studentId,
  };

  try {
    const token = localStorage.getItem("token");

    await axios.post("http://localhost:5000/api/chat/send", messagePayload, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (err) {
    console.error(err);
    toast.error("Failed to send message");
  }

  socket.emit("send_message", { ...messagePayload, roomId });

  setMessages((prev) => [
    ...prev,
    {
      id: `${Date.now()}-${Math.random()}`,
      sender: messagePayload.sender,
      content: messagePayload.content,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
};


  /* ================= SEARCH TEACHERS ================= */
  const handleSearchTeachers = (value) => {
    setTeacherSearch(value);
    const filtered = teachersList.filter((t) =>
      t.name?.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredTeachers(filtered);
    if (filtered.length > 0) setSelectedTeacher(filtered[0]);
  };

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  /* ================= PROFILE UPDATE ================= */
  const handleProfileUpdate = (updated) => {
    setProfileData({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.profileImage,
      score: updated.studentData?.score ?? profileData.score,
      finishedCourses: updated.studentData?.finishedCourses ?? profileData.finishedCourses,
    });
    setIsEditModalOpen(false);
  };

  /* ================= RENDER ================= */
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-gray-500">No student found</div>;

  const enrolledCourses = [
    { id: 1, title: "Intro to Web Development", thumbnail: "/web-development-course.png", progress: 75 },
    { id: 2, title: "Advanced JS", thumbnail: "/javascript-course.png", progress: 45 },
    { id: 3, title: "React Fundamentals", thumbnail: "/react-course.png", progress: 90 },
    { id: 4, title: "Python Data Science", thumbnail: "/python-data-science.png", progress: 30 },
  ];

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
    totalPoints: profileData.score,
    overallProgress: Math.round(enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Header onLogout={handleLogout} />
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditModalOpen(true)} />
          <ProgressOverview stats={stats} />
          <EnrolledCourses courses={enrolledCourses} />
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
                <h3 className="font-semibold text-lg">Student Messaging Center</h3>
                <button className="btn btn-sm btn-error" onClick={() => setIsChatOpen(false)}>Close</button>
              </div>
              <div className="flex flex-1 overflow-hidden">
                <TeacherSidebar
                  users={filteredTeachers}
                  selectedUser={selectedTeacher}
                  onSelectUser={setSelectedTeacher}
                  searchValue={teacherSearch}
                  onSearch={handleSearchTeachers}
                  currentUserId={studentId}
                />
                <div className="flex-1 border-l">
                  <ChatWindow
                    messages={messages}
                    onSend={handleSendMessage}
                    selectedTeacher={selectedTeacher}
                  />
                </div>
              </div>
            </div>
            <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}></div>
          </div>
        )}

        {isEditModalOpen && (
          <EditProfileModal
            profileData={profileData}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </motion.div>
    </div>
  );
}
