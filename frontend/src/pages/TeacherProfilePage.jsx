"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import toast from "react-hot-toast";

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

  // -------------------- PROFILE STATES --------------------
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // -------------------- CHAT STATES --------------------
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [studentsList, setStudentsList] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");

  // -------------------- FETCH TEACHER --------------------
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teacher/id/${id}`);
        if (!res.ok) throw new Error("Failed to fetch teacher data");
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  // -------------------- FAKE STUDENTS --------------------
  useEffect(() => {
    const fakeStudents = [
      { _id: "1", name: "Sarah Johnson", subject: "Web Development" },
      { _id: "2", name: "Mark Lee", subject: "Advanced JS" },
      { _id: "3", name: "Julia Davis", subject: "React Basics" },
      { _id: "4", name: "John Smith", subject: "Python Data Science" },
    ];

    setStudentsList(fakeStudents);
    setFilteredStudents(fakeStudents);
    setSelectedStudent(fakeStudents[0]);
  }, []);

  // -------------------- LOAD MESSAGES WHEN STUDENT CHANGES --------------------
  useEffect(() => {
    if (!selectedStudent) return;

    const fakeMessages = [
      {
        id: "1",
        content: "Hello! I need help with lesson 3.",
        sender: "student",
        timestamp: "10:30 AM",
      },
      {
        id: "2",
        content: "Sure! What is your question?",
        sender: "teacher",
        timestamp: "10:35 AM",
      },
    ];

    setMessages(fakeMessages);
  }, [selectedStudent]);

  // -------------------- SEARCH STUDENTS --------------------
  const handleSearchStudents = (searchTerm) => {
    setStudentSearch(searchTerm);

    const filtered = studentsList.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredStudents(filtered);

    if (filtered.length > 0) {
      setSelectedStudent(filtered[0]);
    }
  };

  // -------------------- SEND MESSAGE --------------------
  const handleSendMessage = (text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        content: text,
        sender: "teacher",
        timestamp: "Now",
      },
    ]);
  };

  // -------------------- HANDLE LOGOUT --------------------
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  // -------------------- PAGE STATES --------------------
  if (loading)
    return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error)
    return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!profileData)
    return <div className="text-center py-10">No teacher found</div>;

  const stats = {
    totalCourses: profileData.totalCourses ?? 0,
    totalStudents: profileData.totalStudents ?? 0,
    rating: profileData.rating?.toFixed(1) ?? "0.0",
    totalPoints: profileData.totalPoints ?? 0,
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        
        {/* Header */}
        <Header onLogout={handleLogout}/>

        <div className="container mx-auto p-6 max-w-7xl space-y-8">

          <ProfileHeader
            profileData={profileData}
            stats={stats}
            onEdit={() => setIsEditOpen(true)}
          />

          {/* Floating Messages Button */}
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

        {/* Edit Profile */}
        <EditProfileDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profileData={profileData}
          setProfileData={setProfileData}
        />

        {/* Chat Modal */}
        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 overflow-hidden w-[90vw] max-w-3xl h-[80vh] flex flex-col">

              {/* Top */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-lg">Teacher Messaging Center</h3>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => setIsChatOpen(false)}
                >
                  Close
                </button>
              </div>

              {/* Chat Body */}
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
      </motion.div>
    </div>
  );
}
