"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { BookOpen, CheckCircle, Clock } from "lucide-react";

import { socket } from "../utils/socket.js";
import DashboardLayout from "../components/profiles/teacher/DashboardLayout";
import LeftPanel from "../components/profiles/teacher/LeftPanel";
import StudentSummaryHeader from "../components/profiles/student/StudentSummaryHeader";
import MainPanel from "../components/profiles/teacher/MainPanel";
import StudentContinueLearningCard from "../components/profiles/student/StudentContinueLearningCard";
import StudentStatsPanel from "../components/profiles/student/StudentStatsPanel";
import StudentRightPanel from "../components/profiles/student/StudentRightPanel";
import StudentPerformancePanel from "../components/profiles/student/StudentPerformancePanel";
import RecentActivity from "../components/profiles/student/RecentActivity";
import AppHeader from "../components/shared/AppHeader";
import EditProfileModal from "../components/profiles/student/EditProfileModal";

export default function StudentProfilePage() {
  // ---------------- PROFILE STATES ----------------
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [progressData, setProgressData] = useState([]); // Progress records with timestamps

  // ---------------- CHAT STATES ----------------
  const [teachersList, setTeachersList] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [messages, setMessages] = useState([]);
  const [teacherSearch, setTeacherSearch] = useState("");
  const [unreadCount, setUnreadCount] = useState({});  // { teacherId: count }

  // Pagination states for cursor-based loading
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const [oldestCursor, setOldestCursor] = useState(null);
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);


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
            // Backend now provides completedLessons, totalLessons, and progress
            const formattedCourses = enrollRes.data.enrolledCourses.map(course => {
              const totalLessons = course.totalLessons || course.lessonIds?.length || 0;
              const completedLessons = Math.min(course.completedLessons || 0, totalLessons);
              const computedProgress = totalLessons > 0
                ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
                : 0;

              return {
                ...course,
                completedLessons,
                totalLessons,
                progress: Math.min(100, course.progress ?? computedProgress)
              };
            });

            console.log('📚 Enrolled courses loaded:', formattedCourses.length, formattedCourses);
            setEnrolledCourses(formattedCourses);
          }
        } catch (enrollErr) {
          console.error("Failed to load enrolled courses:", enrollErr);
        }

        // Fetch progress data for recent activity timestamps
        try {
          const progressRes = await axios.get(
            `http://localhost:5000/api/progress/student/${studentId}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (progressRes.data) {
            const progressArray = Array.isArray(progressRes.data) ? progressRes.data : [];
            console.log('📊 Progress data loaded:', progressArray.length, progressArray);
            setProgressData(progressArray);
          }
        } catch (progressErr) {
          console.error("Failed to load progress data:", progressErr);
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

    // Don't auto-select first teacher - let student choose
    if (teacherList.length === 0) {
      setSelectedTeacher(null);
    }
  }, [enrolledCourses]);

  // ---------------- HANDLE TEACHER SELECTION & SOCKET ----------------
  useEffect(() => {
    if (!selectedTeacher || !studentId || !socket) return;

    const teacherId = selectedTeacher._id || selectedTeacher.id;
    const roomId = `${teacherId}_${studentId}`;
    console.log("Joining room:", roomId);

    // Clear old messages and reset pagination state
    setMessages([]);
    setHasMoreMessages(false);
    setOldestCursor(null);
    setIsInitialLoad(true);

    socket.emit("join_room", { teacherId, studentId });

    // Load latest messages with cursor pagination
    const fetchConversation = async () => {
      try {
        setIsInitialLoad(true);
        const { data } = await axios.get(
          `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`,
          {
            params: { limit: 50 } // Load latest 50 messages
          }
        );

        const { messages: fetchedMessages, hasMore, oldestCursor: cursor } = data;

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

  // ---------------- LOAD MORE MESSAGES (REVERSE INFINITE SCROLL) ----------------
  const handleLoadMoreMessages = async () => {
    if (!selectedTeacher || !studentId || !oldestCursor || isLoadingMoreMessages) return;

    const teacherId = selectedTeacher._id || selectedTeacher.id;

    try {
      setIsLoadingMoreMessages(true);

      const { data } = await axios.get(
        `http://localhost:5000/api/chat/conversation/${teacherId}/${studentId}`,
        {
          params: {
            limit: 50,
            before: oldestCursor // Fetch messages older than current oldest
          }
        }
      );

      const { messages: fetchedMessages, hasMore, oldestCursor: cursor } = data;

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

  // ---------------- PROFILE UPDATE ----------------
  const handleProfileUpdate = (updated) => {
    setProfileData({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      avatar: updated.profileImage,
      score: updated.studentData?.score ?? profileData?.score,
      finishedCourses: updated.studentData?.finishedCourses ?? profileData?.finishedCourses,
    });
    setIsEditModalOpen(false);
  };

  // ---------------- COMPUTE DATA (BEFORE EARLY RETURNS) ----------------
  // Calculate stats from real enrolled courses
  const stats = React.useMemo(() => {
    const totalCourses = enrolledCourses.length;
    const completedCourses = enrolledCourses.filter((c) => {
      const total = c.totalLessons || 0;
      const completed = c.completedLessons || 0;
      return total > 0 && completed >= total;
    }).length;
    const overallProgress = totalCourses > 0
      ? Math.min(
        100,
        Math.round(
          enrolledCourses.reduce((a, c) => a + Math.min(100, c.progress || 0), 0) / totalCourses
        )
      )
      : 0;

    return {
      totalCourses,
      completedCourses,
      totalPoints: profileData?.score ?? 0,
      overallProgress,
    };
  }, [enrolledCourses, profileData]);

  // ---------------- COMPUTE CONTINUE LEARNING DATA ----------------
  const continueLearning = React.useMemo(() => {
    if (enrolledCourses.length === 0) return null;

    // Find most recently updated course from progressData
    const sortedProgress = [...progressData].sort((a, b) => {
      const dateA = new Date(a.lastUpdated || a.updatedAt || 0);
      const dateB = new Date(b.lastUpdated || b.updatedAt || 0);
      return dateB - dateA;
    });

    const recentProgress = sortedProgress[0];
    if (!recentProgress || !recentProgress.courseId) {
      // Fallback: pick first incomplete course, or just first course
      const incompleteCourse = enrolledCourses.find(c => c.progress < 100) || enrolledCourses[0];
      if (!incompleteCourse) return null;

      // Extract first lesson from populated lessonIds
      const firstLesson = incompleteCourse.lessonIds?.[0];
      const firstLessonId = firstLesson?._id || firstLesson;

      console.log('⚠️ No progress data, using fallback course:', incompleteCourse.title, 'First lesson:', firstLesson?.title);

      return {
        courseId: incompleteCourse._id,
        courseTitle: incompleteCourse.title,
        nextLessonTitle: firstLesson?.title || null,
        completedLessons: incompleteCourse.completedLessons,
        totalLessons: incompleteCourse.totalLessons,
        resumeLessonId: firstLessonId ? String(firstLessonId) : null
      };
    }

    // Find matching course in enrolledCourses
    // Extract courseId (handle both string and populated object)
    const progressCourseId = (recentProgress.courseId?._id || recentProgress.courseId)?.toString();
    const course = enrolledCourses.find(c => c._id.toString() === progressCourseId);

    if (!course) {
      console.log('⚠️ Could not match progress courseId:', recentProgress.courseId, 'with enrolled courses');
      return null;
    }

    // Compute next incomplete lesson
    const completedSet = new Set((recentProgress.completedLessons || []).map(id => id.toString()));
    const lessons = course.lessonIds || [];

    let nextLesson = null;
    let resumeLessonId = null;

    // Check if currentLessonId is not completed (resume in-progress)
    if (recentProgress.currentLessonId) {
      const currentId = recentProgress.currentLessonId.toString();
      if (!completedSet.has(currentId)) {
        const currentLesson = lessons.find(l => (l._id || l).toString() === currentId);
        if (currentLesson) {
          nextLesson = currentLesson;
          resumeLessonId = currentId;
        }
      }
    }

    // Otherwise find first incomplete lesson
    if (!nextLesson) {
      nextLesson = lessons.find(l => {
        const lessonId = (l._id || l).toString();
        return !completedSet.has(lessonId);
      });
      resumeLessonId = nextLesson ? (nextLesson._id || nextLesson).toString() : null;
    }

    const result = {
      courseId: course._id,
      courseTitle: course.title,
      nextLessonTitle: nextLesson?.title || null,
      completedLessons: course.completedLessons,
      totalLessons: course.totalLessons,
      resumeLessonId
    };

    console.log('🎯 Continue Learning computed:', result);
    return result;
  }, [enrolledCourses, progressData]);

  // ---------------- COMPUTE RECENT ACTIVITY ----------------
  const recentActivity = React.useMemo(() => {
    if (!progressData.length) {
      return [
        {
          id: "login",
          icon: Clock,
          title: "Logged in",
          detail: "Welcome back to your dashboard",
          timestamp: new Date(),
        },
      ];
    }

    const sortedProgress = [...progressData].sort((a, b) => {
      const dateA = new Date(a.lastUpdated || a.updatedAt || a.createdAt || 0);
      const dateB = new Date(b.lastUpdated || b.updatedAt || b.createdAt || 0);
      return dateB - dateA;
    });

    const activities = sortedProgress.map((progress) => {
      const progressCourseId = (progress.courseId?._id || progress.courseId)?.toString();
      const course = enrolledCourses.find((c) => c._id.toString() === progressCourseId);
      const totalLessons = course?.totalLessons || course?.lessonIds?.length || 0;
      const completedLessons = Math.min(progress.completedLessons?.length || 0, totalLessons);
      const progressPercent = totalLessons > 0
        ? Math.min(100, Math.round((completedLessons / totalLessons) * 100))
        : 0;
      const isCompleted = totalLessons > 0 && completedLessons >= totalLessons;

      if (isCompleted) {
        return {
          id: `complete-${progress._id}`,
          icon: CheckCircle,
          title: "Course completed",
          detail: course?.title || "Course",
          points: 10,
          timestamp: progress.updatedAt || progress.lastUpdated || progress.createdAt,
        };
      }

      if (progress.quizScore) {
        return {
          id: `quiz-${progress._id}`,
          icon: BookOpen,
          title: "Quiz completed",
          detail: `${course?.title || "Course"} • ${progress.quizScore}% score`,
          timestamp: progress.updatedAt || progress.lastUpdated || progress.createdAt,
        };
      }

      return {
        id: `progress-${progress._id}`,
        icon: BookOpen,
        title: "Course progress",
        detail: `${course?.title || "Course"} • ${completedLessons}/${totalLessons} lessons (${progressPercent}%)`,
        timestamp: progress.updatedAt || progress.lastUpdated || progress.createdAt,
      };
    });

    return activities.slice(0, 5);
  }, [enrolledCourses, progressData]);

  // ---------------- LOADING & ERROR STATES ----------------
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  if (!profileData) return <div className="min-h-screen flex items-center justify-center text-gray-500">No student found</div>;

  return (
    <>
      <DashboardLayout
        header={<AppHeader subtitle="Student Profile" />}
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
                <div className="flex gap-6">
                  <div className="Learning-Overview w-full">
                    {/* <div>
                      <StudentStatsPanel stats={stats} />
                    </div> */}
                    <div>
                      <StudentPerformancePanel stats={stats} />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6">
                  <StudentContinueLearningCard
                    continueLearning={continueLearning}
                    recentActivity={[]}
                  />
                  <div>
                    <RecentActivity activities={recentActivity} />
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
            onLoadMoreMessages={handleLoadMoreMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMoreMessages={isLoadingMoreMessages}
            isInitialLoad={isInitialLoad}
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
