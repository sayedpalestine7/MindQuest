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
import CommentsPanel from "../components/profiles/teacher/CommentsPanel";
import StatsPanel from "../components/profiles/teacher/StatsPanel";
import RightPanel from "../components/profiles/teacher/RightPanel";
import AppHeader from "../components/shared/AppHeader";
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
  
  // Pagination states for cursor-based loading
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestCursor, setOldestCursor] = useState(null);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
        
        // Calculate total students enrolled across all courses
        const courses = teacher.courses || [];
        const totalCourses = courses.length;
        const totalEnrolledStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);
        
        // Enrich with calculated stats if not in backend response
        const enrichedData = {
          ...teacher,
          totalCourses: totalCourses || teacher.totalCourses || 0,
          totalEnrolledStudents: totalEnrolledStudents,
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
        if (!teacherId) return;

        // If teacher has no courses, there can be no enrolled students.
        if (Array.isArray(profileData?.courses) && profileData.courses.length === 0) {
          setStudentsList([]);
          setFilteredStudents([]);
          setSelectedStudent(null);
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setStudentsList([]);
          setFilteredStudents([]);
          setSelectedStudent(null);
          return;
        }

        const res = await axios.get("http://localhost:5000/api/chat/teacher/students", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const students = Array.isArray(res.data) ? res.data : [];

        setStudentsList(students);
        setFilteredStudents(students);
        // Don't auto-select first student - let teacher choose
        setSelectedStudent(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch students");
      }
    };
    fetchStudents();
  }, [profileData, teacherId]);

  /* ====== Chat Socket + Conversation (with Cursor Pagination) ====== */
  useEffect(() => {
    if (!selectedStudent || !teacherId || !socket) return;

    const studentId = selectedStudent._id || selectedStudent.id;
    const roomId = `${teacherId}_${studentId}`;

    // Clear old messages and reset pagination state
    setMessages([]);
    setHasMoreMessages(false);
    setOldestCursor(null);
    setIsInitialLoad(true);

    // Join room
    socket.emit("join_room", { teacherId, studentId });

    // Fetch latest messages (initial load with cursor pagination)
    const fetchConversation = async () => {
      try {
        setIsInitialLoad(true);
        const res = await axios.get(
          `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`,
          {
            params: { limit: 50 } // Load latest 50 messages
          }
        );
        
        const { messages: fetchedMessages, hasMore, oldestCursor: cursor } = res.data;
        
        // Backend returns descending (newest first), so reverse for display (oldest first)
        const msgs = (fetchedMessages || []).reverse().map((m) => ({
          id: m._id,
          sender: m.sender,
          content: m.content,
          timestamp: new Date(m.createdAt || m.timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        }));
        
        setMessages(msgs);
        setHasMoreMessages(hasMore);
        setOldestCursor(cursor);
        
        // After initial load, allow auto-scroll for new messages
        // Wait 600ms to ensure all scroll attempts complete (100ms, 350ms, 500ms)
        setTimeout(() => setIsInitialLoad(false), 600);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load messages");
        setIsInitialLoad(false);
      }
    };
    fetchConversation();

    // Listen for incoming messages
    const handleNewMessage = (msg) => {
      const msgTeacherId = msg.teacher || msg.teacherId;
      const msgStudentId = msg.student || msg.studentId;

      // Skip messages sent by this client (optimistic UI)
      if (
        msg.sender === "teacher" &&
        String(msgTeacherId) === String(teacherId)
      ) {
        return;
      }

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

  /* ====== Load More Messages (Reverse Infinite Scroll) ====== */
  const handleLoadMoreMessages = async () => {
    if (!selectedStudent || !teacherId || !oldestCursor || isLoadingMoreMessages) return;

    const studentId = selectedStudent._id || selectedStudent.id;
    
    try {
      setIsLoadingMoreMessages(true);
      
      const res = await axios.get(
        `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`,
        {
          params: { 
            limit: 50,
            before: oldestCursor // Fetch messages older than current oldest
          }
        }
      );
      
      const { messages: fetchedMessages, hasMore, oldestCursor: cursor } = res.data;
      
      // Backend returns descending, reverse for display
      const olderMsgs = (fetchedMessages || []).reverse().map((m) => ({
        id: m._id,
        sender: m.sender,
        content: m.content,
        timestamp: new Date(m.createdAt || m.timestamp).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      }));
      
      // Prepend older messages
      setMessages((prev) => [...olderMsgs, ...prev]);
      setHasMoreMessages(hasMore);
      setOldestCursor(cursor);
    } catch (err) {
      console.error('Failed to load more messages:', err);
      toast.error("Failed to load older messages");
    } finally {
      setIsLoadingMoreMessages(false);
    }
  };

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

  /* ====== Course Selection (for inter-panel communication) ====== */
  const handleCourseSelect = (courseId) => {
    setActiveCourseId(courseId);
    // Future: can trigger performance updates or filter chat by course context
  };

  /* ====== Handle Course Update (after publish/unpublish/archive) ====== */
  const handleCourseUpdate = (updatedCourse) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      
      const updatedCourses = prev.courses?.map((course) => {
        const cid = course._id || course.id;
        const updatedCid = updatedCourse._id || updatedCourse.id;
        return cid === updatedCid ? { ...course, ...updatedCourse } : course;
      }) || [];
      
      return { ...prev, courses: updatedCourses };
    });
  };

  /* ====== Handle Course Delete ====== */
  const handleCourseDelete = (deletedCourseId) => {
    setProfileData((prev) => {
      if (!prev) return prev;
      
      // Remove the course from the courses array
      const updatedCourses = prev.courses?.filter((course) => {
        const cid = course._id || course.id;
        return cid !== deletedCourseId;
      }) || [];
      
      // Recalculate stats
      const totalCourses = updatedCourses.length;
      const totalEnrolledStudents = updatedCourses.reduce((sum, course) => sum + (course.students || 0), 0);
      
      return { 
        ...prev, 
        courses: updatedCourses,
        totalCourses,
        totalEnrolledStudents
      };
    });
    
    // Clear active course if it was deleted
    if (activeCourseId === deletedCourseId) {
      setActiveCourseId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-gray-500">No teacher found</div>;

  const stats = {
    totalCourses: profileData.totalCourses ?? 0,
    totalEnrolledStudents: profileData.totalEnrolledStudents ?? 0,
    rating: Number(profileData.rating) || 0,
    totalPoints: profileData.totalPoints ?? 0,
  };

  return (
    <>
    
      <DashboardLayout
      header={<AppHeader subtitle="Teacher Profile" />}
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
            <div className="h-full min-h-0">
              <div className="flex flex-col gap-6 h-full min-h-0">
                <div className="shrink-0">
                  <StatsPanel stats={stats} layout="grid" title="Overview" />
                </div>
                <div className="flex-1 min-h-0">
                  <CommentsPanel teacherId={teacherId} />
                </div>
              </div>
            </div>
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
          onCourseDelete={handleCourseDelete}
          
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
          onLoadMoreMessages={handleLoadMoreMessages}
          hasMoreMessages={hasMoreMessages}
          isLoadingMoreMessages={isLoadingMoreMessages}
          isInitialLoad={isInitialLoad}
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
