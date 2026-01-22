import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Users } from "lucide-react";

export default function StudentSidebar({
  students = [],
  selectedStudent,
  onSelectStudent,
  searchValue,
  onSearch,
  socket,
  teacherId,
  unreadCount = {},
  setUnreadCount,
}) {
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [studentsList, setStudentsList] = useState(students);

  const getStudentId = (s) => s._id ?? s.id;

  useEffect(() => setStudentsList(students), [students]);

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.sender === "student" && msg.studentId && msg.teacherId === teacherId) {
        if (setUnreadCount) {
          setUnreadCount((prev) => ({
            ...prev,
            [msg.studentId]: (prev[msg.studentId] || 0) + 1,
          }));
        }
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, teacherId, setUnreadCount]);

  // Reset unread when student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const studentId = getStudentId(selectedStudent);
    const studentRoomId = `${teacherId}_${studentId}`;
    socket?.emit("join_room", { roomId: studentRoomId });

    if (setUnreadCount) {
      setUnreadCount((prev) => ({
        ...prev,
        [studentId]: 0,
      }));
    }

    return () => {
      socket?.emit("leave_room", { roomId: studentRoomId });
    };
  }, [selectedStudent, socket, teacherId, setUnreadCount]);

  const courses = [...new Set(studentsList.map((s) => s.subject).filter(Boolean))];

  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      s.subject?.toLowerCase().includes(searchValue.toLowerCase());

    let matchesFilter = true;
    if (filter === "unread") matchesFilter = (unreadCount[getStudentId(s)] || 0) > 0;
    else if (filter === "course") matchesFilter = courseFilter ? s.subject === courseFilter : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 h-full min-h-0 flex flex-col"
      style={{ borderRight: '1px solid #E0E0E0', backgroundColor: '#FFFFFF' }}
    >
      {/* Header */}
      {/* <div className="p-4 text-white" style={{ borderBottom: '1px solid #E0E0E0', backgroundColor: '#3F51B5' }}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" /> Students ({filteredStudents.length})
        </h3>
      </div> */}

      {/* Search & Filters */}
      <div className="p-4 space-y-3" style={{ borderBottom: '1px solid #E0E0E0', backgroundColor: '#FFFFFF' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#607D8B' }} />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full border rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring-2"
            style={{ borderColor: '#E0E0E0', color: '#263238' }}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "course"].map((f) => (
            <motion.button
              key={f}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-sm font-semibold transition"
              style={{
                backgroundColor: filter === f ? '#3864dd' : '#E0E0E0',
                color: filter === f ? '#FFFFFF' : '#607D8B'
              }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </motion.button>
          ))}
        </div>

        {filter === "course" && (
          <div className="flex gap-2 flex-wrap mt-2">
            <button
              className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                courseFilter === "" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
              onClick={() => setCourseFilter("")}
            >
              All
            </button>
            {courses.map((c) => (
              <button
                key={c}
                className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                  courseFilter === c ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
                onClick={() => setCourseFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((s, idx) => {
            const isSelected =
              selectedStudent && getStudentId(selectedStudent) === getStudentId(s);
            const unread = unreadCount[getStudentId(s)] || 0;

            return (
              <motion.button
                key={getStudentId(s)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onSelectStudent(s)}
                className="w-full text-left p-3 flex items-center gap-3 transition-all"
                style={{
                  borderBottom: '1px solid #E0E0E0',
                  backgroundColor: isSelected ? '#eff6ff' : 'transparent',
                  borderLeft: isSelected ? '4px' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = '#F5F7FA';
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {/* Avatar */}
                <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ border: '2px solid #E0E0E0' }}>
                  {s.avatar ? (
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(to bottom right, #3864dd, #3864dd)' }}>
                      {s.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: isSelected ? '#3864dd' : '#263238' }}>
                    {s.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#607D8B' }}>
                    {s.subject || "Student"}
                  </p>
                </div>

                {/* Unread Badge */}
                {/* {unread > 0 && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#E53935' }}
                  >
                    {Math.min(unread, 9)}+
                  </motion.div>
                )} */}
              </motion.button>
            );
          })
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-gray-500 p-8"
          >
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="font-semibold">No students found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
