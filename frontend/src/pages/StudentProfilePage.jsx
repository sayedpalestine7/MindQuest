"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";

// Components
import Header from "../components/profiles/student/Header";
import ProfileHeader from "../components/profiles/student/ProfileHeader";
import ProgressOverview from "../components/profiles/student/ProgressOverview";
import EnrolledCourses from "../components/profiles/student/EnrolledCourses";
import EditProfileModal from "../components/profiles/student/EditProfileModal";
import TeacherSidebar from "../components/student-chat/TeacherSidebar";
import ChatWindow from "../components/student-chat/ChatWindow";

export default function StudentProfilePage() {
  
  // -------------------- PROFILE STATES --------------------
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // -------------------- CHAT STATES --------------------
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [teachersList, setTeachersList] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");

  // -------------------- FETCH STUDENT PROFILE --------------------
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentId = localStorage.getItem("userId");

        if (!token || !studentId) {
          toast.error("Please login first");
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/student/id/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

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
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // -------------------- FAKE TEACHERS FOR TESTING --------------------
  useEffect(() => {
    const fakeTeachers = [
      { _id: "t1", name: "Dr. Sarah Johnson", subject: "Web Development", avatar: "" },
      { _id: "t2", name: "Prof. Mark Lee", subject: "Advanced JS", avatar: "" },
      { _id: "t3", name: "Eng. Julia Davis", subject: "React Fundamentals", avatar: "" },
      { _id: "t4", name: "Dr. John Smith", subject: "Python Data Science", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
    ];
    setTeachersList(fakeTeachers);
    setFilteredTeachers(fakeTeachers);
    setSelectedTeacher(fakeTeachers[0]);
  }, []);

  // -------------------- FAKE MESSAGES --------------------
  useEffect(() => {
    if (!selectedTeacher) return;

    const fakeMessages = [
      { id: "1", content: "Hello! I need help with lesson 3.", sender: "student", timestamp: "10:30 AM" },
      { id: "2", content: "Sure! What is your question?", sender: "teacher", timestamp: "10:35 AM" },
    ];

    setMessages(fakeMessages);
  }, [selectedTeacher]);

  // -------------------- HANDLE LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // -------------------- HANDLE PROFILE UPDATE --------------------
  const handleProfileUpdate = (updatedData) => {
    setProfileData({
      _id: updatedData._id,
      name: updatedData.name,
      email: updatedData.email,
      avatar: updatedData.profileImage,
      score: updatedData.studentData?.score ?? profileData.score,
      finishedCourses: updatedData.studentData?.finishedCourses ?? profileData.finishedCourses,
    });
    setIsEditModalOpen(false);
  };

  // -------------------- ENROLLED COURSES --------------------
  const enrolledCourses = [
    { id: 1, title: "Intro to Web Development", thumbnail: "/web-development-course.png", progress: 75 },
    { id: 2, title: "Advanced JS", thumbnail: "/javascript-course.png", progress: 45 },
    { id: 3, title: "React Fundamentals", thumbnail: "/react-course.png", progress: 90 },
    { id: 4, title: "Python Data Science", thumbnail: "/python-data-science.png", progress: 30 },
  ];

  const stats = profileData
    ? {
        totalCourses: enrolledCourses.length,
        completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
        totalPoints: profileData.score,
        overallProgress: Math.round(enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length),
      }
    : {};

  // -------------------- HANDLE MESSAGE SEND --------------------
  const handleSendMessage = (text) => {
    if (!text.trim()) return;
    const newMessage = {
      id: Date.now().toString(),
      content: text,
      sender: "student",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  // -------------------- TEACHER SEARCH --------------------
  const handleSearchTeachers = (searchTerm) => {
    setTeacherSearch(searchTerm);
    const filtered = teachersList.filter((teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
    if (filtered.length > 0) setSelectedTeacher(filtered[0]);
  };

  // -------------------- RENDER --------------------
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (!profileData)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">No student found</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* HEADER */}
        <Header onLogout={handleLogout} />

        {/* PROFILE & COURSES */}
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
            className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <span>💬</span> Messages
          </motion.button>
        {/* CHAT MODAL */}
        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 overflow-hidden w-[90vw] max-w-3xl h-[80vh] flex flex-col">
              
              {/* Top Bar */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-lg">Student Messaging Center</h3>
                <button className="btn btn-sm btn-error" onClick={() => setIsChatOpen(false)}>
                  Close
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex flex-1 overflow-hidden">
                <TeacherSidebar
                  teachers={filteredTeachers}
                  selectedTeacher={selectedTeacher}
                  onSelectTeacher={setSelectedTeacher}
                  searchValue={teacherSearch}
                  onSearch={handleSearchTeachers}
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

            {/* Backdrop */}
            <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}></div>
          </div>
        )}

        {/* EDIT PROFILE MODAL */}
        {isEditModalOpen && (
          <EditProfileModal profileData={profileData} onClose={() => setIsEditModalOpen(false)} onUpdate={handleProfileUpdate} />
        )}
      </motion.div>
    </div>
  );
}
