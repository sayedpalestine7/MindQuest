"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import axios from "axios";
import { useParams } from "react-router";

import { socket } from "../utils/socket.js";
import DashboardLayout from "../components/profiles/teacher/DashboardLayout";
import LeftPanel from "../components/profiles/teacher/LeftPanel";
import UserSummaryHeader from "../components/profiles/teacher/UserSummaryHeader";
import MainPanel from "../components/profiles/teacher/MainPanel";
import PerformancePanel from "../components/profiles/teacher/PerformancePanel";
import StatsPanel from "../components/profiles/teacher/StatsPanel";
import RightPanel from "../components/profiles/teacher/RightPanel";
import Header from "../components/profiles/teacher/Header";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";

export default function TeacherProfilePage() {
  const { id: routeTeacherId } = useParams();
  const teacherId = routeTeacherId || (typeof window !== "undefined" ? localStorage.getItem("userId") : null);

  /* ====== Profile States ====== */
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeCourseId, setActiveCourseId] = useState(null);

  /* ====== Chat States ====== */
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

  /* ====== Course Selection (for inter-panel communication) ====== */
  const handleCourseSelect = (courseId) => {
    setActiveCourseId(courseId);
    // Future: can trigger performance updates or filter chat by course context
  };

  /* ====== Handle Course Update (after publish/unpublish) ====== */
  const handleCourseUpdate = (updatedCourse) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      
      const updatedCourses = prev.courses?.map((course) => {
        const cid = course._id || course.id;
        const updatedCid = updatedCourse._id || updatedCourse.id;
        return cid === updatedCid ? { ...course, published: updatedCourse.published } : course;
      }) || [];
      
      return { ...prev, courses: updatedCourses };
    });
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
    <>
    <DashboardLayout
      header={<Header onLogout={handleLogout} teacherId={teacherId} />}
      leftPanel={
        <LeftPanel
          userSummary={
            <UserSummaryHeader
              profileData={profileData}
              stats={stats}
              onEdit={() => setIsEditOpen(true)}
            />
          }
          mainContent={
            <MainPanel>
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PerformancePanel stats={stats} />
                </div>
                <div>
                  <StatsPanel stats={stats} />
                </div>
              </div>
            </MainPanel>
          }
        />
      }
      rightPanel={
        <RightPanel
          // Courses props
          courses={profileData.courses ?? []}
          activeCourseId={activeCourseId}
          onCourseSelect={handleCourseSelect}
          onCourseUpdate={handleCourseUpdate}
          
          // Chat props
          students={filteredStudents}
          selectedStudent={selectedStudent}
          onSelectStudent={setSelectedStudent}
          messages={messages}
          onSendMessage={handleSendMessage}
          studentSearch={studentSearch}
          onSearchStudents={handleSearchStudents}
          socket={socket}
          teacherId={teacherId}
          unreadCount={unreadCount}
          setUnreadCount={setUnreadCount}
        />
      }
    />
    
    {/* Edit Profile Modal */}
    {isEditOpen && (
      <EditProfileDialog
        open={isEditOpen}
        profileData={profileData}
        onClose={() => setIsEditOpen(false)}
        setProfileData={setProfileData}
      />
    )}
    </>
  );
}
