"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";

import { socket } from "../utils/socket.js";
import DashboardLayout from "../components/profiles/teacher/DashboardLayout";
import LeftPanel from "../components/profiles/teacher/LeftPanel";
import StudentSummaryHeader from "../components/profiles/student/StudentSummaryHeader";
import MainPanel from "../components/profiles/teacher/MainPanel";
import StudentPerformancePanel from "../components/profiles/student/StudentPerformancePanel";
import StudentStatsPanel from "../components/profiles/student/StudentStatsPanel";
import StudentRightPanel from "../components/profiles/student/StudentRightPanel";
import Header from "../components/profiles/student/Header";
import EditProfileModal from "../components/profiles/student/EditProfileModal";

export default function StudentProfilePage() {
  // ---------------- PROFILE STATES ----------------
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);

  // ---------------- CHAT STATES ----------------
  const [teachersList, setTeachersList] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState({});  // { teacherId: count }


  const studentId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;
  const getTeacherId = (teacher) => teacher?._id ?? teacher?.id;

  // ---------------- FETCH STUDENT PROFILE ----------------
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !studentId) throw new Error("Login required");

        const { data } = await axios.get(
          `http://localhost:5000/api/student/id/${studentId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setProfileData({
          _id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.profileImage,
          score: data.studentData?.score ?? 0,
          finishedCourses: data.studentData?.finishedCourses ?? 0,
        });

        // Fetch enrolled courses
        try {
          const enrollRes = await axios.get(
            `http://localhost:5000/api/student/${studentId}/courses`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (enrollRes.data && enrollRes.data.enrolledCourses) {
            console.log('Raw enrolled courses data:', enrollRes.data.enrolledCourses);
            
            // Backend now provides completedLessons, totalLessons, and progress
            const formattedCourses = enrollRes.data.enrolledCourses.map(course => ({
              ...course,
              completedLessons: course.completedLessons || 0,
              totalLessons: course.totalLessons || course.lessonIds?.length || 0,
              progress: course.progress || 0
            }));
            
            console.log('Formatted courses:', formattedCourses);
            setEnrolledCourses(formattedCourses);
          }
        } catch (enrollErr) {
          console.error("Failed to load enrolled courses:", enrollErr);
        }
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

  // ---------------- BUILD TEACHERS FROM ENROLLED COURSES ----------------
  useEffect(() => {
    const teacherMap = new Map();

    enrolledCourses.forEach((course) => {
      const teacher = course.teacherId;
      if (!teacher) return;

      const teacherId = getTeacherId(teacher) || teacher;
      if (!teacherId) return;

      if (!teacherMap.has(teacherId)) {
        teacherMap.set(teacherId, {
          _id: teacherId,
          name: teacher.name,
          email: teacher.email,
          avatar: teacher.profileImage || teacher.avatar,
          courses: [],
        });
      }

      const entry = teacherMap.get(teacherId);
      const courseTitle = course.title || course.name;
      if (courseTitle && !entry.courses.includes(courseTitle)) {
        entry.courses.push(courseTitle);
      }
    });

    const teacherList = Array.from(teacherMap.values());
    setTeachersList(teacherList);
    setFilteredTeachers(teacherList);

    if (teacherList.length === 0) {
      setSelectedTeacher(null);
      return;
    }

    if (!selectedTeacher || !teacherList.some((t) => getTeacherId(t) === getTeacherId(selectedTeacher))) {
      setSelectedTeacher(teacherList[0]);
    }
  }, [enrolledCourses, selectedTeacher]);

  // ---------------- HANDLE TEACHER SELECTION & SOCKET ----------------
  useEffect(() => {
    if (!selectedTeacher || !studentId || !socket) return;

    const teacherId = selectedTeacher._id || selectedTeacher.id;
    const roomId = `${teacherId}_${studentId}`;
    console.log("Joining room:", roomId);

    setMessages([]); // clear previous messages
    socket.emit("join_room", { teacherId, studentId });

    // Load conversation
    const fetchConversation = async () => {
      try {
        const { data } = await axios.get(
          `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`
        );

        const msgs = (data || []).map((m) => ({
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

      // Skip messages sent by this client (optimistic UI)
      if (msg.sender === "student" && msgStudentId === studentId) return;

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
  }, [selectedTeacher, studentId]);

  // ---------------- SEND MESSAGE ----------------
  const handleSendMessage = (text) => {
    if (!text.trim() || !socket || !selectedTeacher) return;

    const teacherId = selectedTeacher._id || selectedTeacher.id;

    // Optimistic UI: add message instantly
    const tempMessage = {
      id: `temp-${Date.now()}`,
      sender: "student",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, tempMessage]);

    // Emit to socket
    socket.emit("send_message", {
      content: text,
      sender: "student",
      teacherId,
      studentId,
    });
  };

  // ------------- Fetch unread counts once and update live -------------
  useEffect(() => {
    if (!studentId) return;

    const fetchUnread = async () => {
      try {
        // Backend route: GET /api/chat/student/unread/:studentId
        const res = await axios.get(
          `http://localhost:5000/api/chat/student/unread/${studentId}`
        );

        const map = {};
        res.data.forEach((item) => (map[item._id] = item.count));

        setUnreadCount(map);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUnread();
  }, [studentId]);

  // ---------------- SEARCH TEACHERS ----------------
  const handleSearchTeachers = (value) => {
    setTeacherSearch(value);
    const query = value.toLowerCase();
    const filtered = teachersList.filter((t) =>
      t.name?.toLowerCase().includes(query) ||
      (t.courses || []).some((c) => c.toLowerCase().includes(query))
    );
    setFilteredTeachers(filtered);
    if (filtered.length > 0) setSelectedTeacher(filtered[0]);
  };

  // ---------------- LOGOUT ----------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // ---------------- PROFILE UPDATE ----------------
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

  // ---------------- LOADING & ERROR STATES ----------------
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-gray-500">No student found</div>;

  // Calculate stats from real enrolled courses
  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
    totalPoints: profileData.score,
    overallProgress: enrolledCourses.length > 0 
      ? Math.round(enrolledCourses.reduce((a, c) => a + (c.progress || 0), 0) / enrolledCourses.length)
      : 0,
  };

  return (
    <>
      <DashboardLayout
        header={<Header onLogout={handleLogout} />}
        leftPanel={
          <LeftPanel
            userSummary={
              <StudentSummaryHeader
                profileData={profileData}
                stats={stats}
                onEdit={() => setIsEditModalOpen(true)}
              />
            }
            mainContent={
              <MainPanel>
                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <StudentPerformancePanel stats={stats} />
                  </div>
                  <div>
                    <StudentStatsPanel stats={stats} />
                  </div>
                </div>
              </MainPanel>
            }
          />
        }
        rightPanel={
          <StudentRightPanel
            // Courses props
            courses={enrolledCourses}
            
            // Chat props
            teachers={filteredTeachers}
            selectedTeacher={selectedTeacher}
            onSelectTeacher={setSelectedTeacher}
            messages={messages}
            onSendMessage={handleSendMessage}
            teacherSearch={teacherSearch}
            onSearchTeachers={handleSearchTeachers}
            socket={socket}
            studentId={studentId}
            unreadCount={unreadCount}
            setUnreadCount={setUnreadCount}
          />
        }
      />
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <EditProfileModal
          profileData={profileData}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </>
  );
}
