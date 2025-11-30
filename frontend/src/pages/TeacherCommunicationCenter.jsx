import { useState, useRef, useEffect } from "react";
import StudentSidebar from "../components/teacher-chat/StudentSidebar";
import ChatHeader from "../components/teacher-chat/ChatHeader";
import ChatMessages from "../components/teacher-chat/ChatMessages";
import MessageInput from "../components/teacher-chat/MessageInput";

import { dummyStudents, dummyMessages } from "../components/teacher-chat/dummyData.js";

export default function TeacherCommunicationCenter() {
  const [students, setStudents] = useState(dummyStudents);
  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  const [messages, setMessages] = useState(dummyMessages[selectedStudent.id]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [messageInput, setMessageInput] = useState("");

  const messagesEndRef = useRef(null);

  // Compute filtered students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (filterType) {
      case "unread":
        return student.unreadCount > 0;
      case "favorites":
        return student.isFavorite;
      case "course":
        return selectedCourse ? student.course === selectedCourse : true;
      default: // "all"
        return true;
    }
  });


  // Scroll to last message whenever messages or selectedStudent change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, selectedStudent]);

  const handleSend = () => {
    if (!messageInput.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "teacher",
      content: messageInput,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages([...messages, newMsg]);
    setMessageInput("");
  };

  return (
    <div className="flex h-[80vh] max-h-[90vh] w-full max-w-6xl mx-auto border rounded-lg overflow-hidden bg-white shadow-lg">

      {/* LEFT SIDEBAR */}
      <StudentSidebar
        students={filteredStudents}
        selectedStudent={selectedStudent}
        onSelectStudent={(s) => {
          setSelectedStudent(s);
          setMessages(dummyMessages[s.id] || []);
        }}
        onToggleFavorite={(id) => {
          setStudents(students.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
        }}
        filterType={filterType}
        setFilterType={setFilterType}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCourse={selectedCourse}
        setSelectedCourse={setSelectedCourse}
      />

      {/* RIGHT CHAT PANEL */}
      <div className="flex flex-col flex-1">
        <ChatHeader student={selectedStudent} />

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ChatMessages messages={messages} />
          <div ref={messagesEndRef} /> {/* Scroll to this */}
        </div>

        <MessageInput
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}
