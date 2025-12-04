"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router"; // make sure to use react-router-dom
import toast from "react-hot-toast";
import { io } from "socket.io-client";

import ProfileHeader from "../components/profiles/teacher/ProfileHeader";
import Header from "../components/profiles/teacher/Header";
import StatsSection from "../components/profiles/teacher/StatsSection";
import CoursesSection from "../components/profiles/teacher/CoursesSection";
import PerformanceSection from "../components/profiles/teacher/PerformanceSection";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";
import ChatWindow from "../components/teacher-chat/ChatWindow.jsx";
import StudentSidebar from "../components/teacher-chat/StudentSidebar.jsx";

export default function TeacherProfilePage() {
  const { id } = useParams();
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

  const [socket, setSocket] = useState(null);

  // -------------------- FETCH TEACHER PROFILE --------------------
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teacher/id/${id}`);
        if (!res.ok) throw new Error("Failed to fetch teacher profile");
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };
    fetchProfile();
  }, [id]);

  // -------------------- SOCKET.IO SETUP --------------------
  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);

    s.on("connect", () => {
      console.log("Connected to socket server", s.id);
    });

    s.on("receive_message", (msg) => {
      // Only add message if it belongs to the current student
      if (selectedStudent && 
          (msg.student === selectedStudent.id || msg.student === selectedStudent._id)) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => s.disconnect();
  }, [selectedStudent]);

  // -------------------- FETCH ALL STUDENTS --------------------
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/users");
        if (!res.ok) throw new Error("Failed to fetch users");
        const data = await res.json();

        // Only students
        const students = data.filter((u) => u.userType === "student");
        setStudentsList(students);
        setFilteredStudents(students);
        if (students.length > 0) setSelectedStudent(students[0]);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // -------------------- LOAD MESSAGES --------------------
  useEffect(() => {
    if (!selectedStudent || !socket) return;

    const roomId = `${id}_${selectedStudent.id || selectedStudent._id}`;
    socket.emit("join_room", { roomId });

    // Load existing conversation
    const loadConversation = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/chat/conversation/${id}/${selectedStudent.id || selectedStudent._id}`
        );
        if (!res.ok) throw new Error("Failed to load conversation");
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
        toast.error(err.message);
      }
    };
    loadConversation();

    return () => socket.emit("leave_room", { roomId });
  }, [selectedStudent, socket, id]);

  // -------------------- SEARCH STUDENTS --------------------
  const handleSearchStudents = (searchTerm) => {
    setStudentSearch(searchTerm);
    const filtered = studentsList.filter(
      (s) =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.subject && s.subject.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredStudents(filtered);
    if (filtered.length > 0) setSelectedStudent(filtered[0]);
  };

  // -------------------- SEND MESSAGE --------------------
  const handleSendMessage = async (text) => {
    if (!selectedStudent || !text.trim() || !socket) return;

    const newMsg = {
      content: text,
      sender: "teacher",
      teacher: id,
      student: selectedStudent.id || selectedStudent._id,
      timestamp: new Date().toISOString(),
    };

    const roomId = `${id}_${selectedStudent.id || selectedStudent._id}`;

    try {
      await fetch("http://localhost:5000/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMsg),
      });
    } catch (err) {
      toast.error("Failed to send message");
    }

    socket.emit("send_message", { roomId, ...newMsg });
    setMessages((prev) => [...prev, newMsg]);
  };

  // -------------------- LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // -------------------- PAGE STATES --------------------
  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!profileData) return <div className="text-center py-10">No teacher found</div>;

  const stats = {
    totalCourses: profileData.totalCourses ?? 0,
    totalStudents: profileData.totalStudents ?? 0,
    rating: profileData.rating?.toFixed(1) ?? "0.0",
    totalPoints: profileData.totalPoints ?? 0,
  };

  // -------------------- RENDER --------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Header onLogout={handleLogout} />

        <div className="container mx-auto p-6 max-w-7xl space-y-8">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditOpen(true)} />
          <motion.button
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-8 right-8 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
          >
            💬 Messages
          </motion.button>

          <PerformanceSection stats={stats} />
          <StatsSection stats={stats} />
          <CoursesSection courses={profileData.courses ?? []} />
        </div>

        <EditProfileDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profileData={profileData}
          setProfileData={setProfileData}
        />

        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 overflow-hidden w-[90vw] max-w-3xl h-[80vh] flex flex-col">
              <div className="flex justify-between items-center p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-lg">Teacher Messaging Center</h3>
                <button className="btn btn-sm btn-error" onClick={() => setIsChatOpen(false)}>
                  Close
                </button>
              </div>

              <div className="flex flex-1 overflow-hidden">
                <StudentSidebar
                  students={filteredStudents}
                  selectedStudent={selectedStudent}
                  onSelectStudent={setSelectedStudent} // ✅ correct
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
      </motion.div>
    </div>
  );
}
