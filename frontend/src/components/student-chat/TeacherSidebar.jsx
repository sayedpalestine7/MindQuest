import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Users } from "lucide-react";

export default function TeacherSidebar({
  users = [],
  selectedUser,
  onSelectUser,
  searchValue,
  onSearch,
  currentUserId,
  socket,
  studentId,
  unreadCount = {},
  setUnreadCount,
}) {
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [usersList, setUsersList] = useState(users);

  useEffect(() => setUsersList(users), [users]);

  const getUserId = (u) => u._id ?? u.id;

  // Handle incoming messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (msg.sender === "teacher" && msg.teacherId && msg.studentId === studentId) {
        if (setUnreadCount) {
          setUnreadCount((prev) => ({
            ...prev,
            [msg.teacherId]: (prev[msg.teacherId] || 0) + 1,
          }));
        }
      }
    };

    socket.on("new_message", handleNewMessage);
    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, studentId, setUnreadCount]);

  // Reset unread when teacher is selected
  useEffect(() => {
    if (!selectedUser) return;

    const teacherId = getUserId(selectedUser);
    const roomId = `${teacherId}_${studentId}`;
    socket?.emit("join_room", { roomId });

    if (setUnreadCount) {
      setUnreadCount((prev) => ({
        ...prev,
        [teacherId]: 0,
      }));
    }

    return () => {
      socket?.emit("leave_room", { roomId });
    };
  }, [selectedUser, socket, studentId, setUnreadCount]);

  const getTeacherCourses = (u) => Array.isArray(u.courses) ? u.courses : [];

  const courses = [
    ...new Set(
      usersList.flatMap((u) => getTeacherCourses(u)).filter(Boolean)
    )
  ];

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      (u.name || "").toLowerCase().includes((searchValue || "").toLowerCase()) ||
      getTeacherCourses(u).some((c) =>
        c.toLowerCase().includes((searchValue || "").toLowerCase())
      );

    let matchesFilter = true;
    if (filter === "unread") matchesFilter = (unreadCount[getUserId(u)] || 0) > 0;
    else if (filter === "course") {
      matchesFilter = courseFilter ? getTeacherCourses(u).includes(courseFilter) : true;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <motion.div 
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-80 h-full min-h-0 flex flex-col"
      style={{ borderRight: '1px solid #E0E0E0', backgroundColor: '#F5F7FA' }}
    >
      {/* Header */}
      {/* <div className="p-4 text-white" style={{ borderBottom: '1px solid #E0E0E0', background: 'linear-gradient(to right, #3F51B5, #5C6BC0)' }}>
        <h3 className="font-bold text-lg flex items-center gap-2">
          <Users className="w-5 h-5" /> Teachers ({filteredUsers.length})
        </h3>
      </div> */}

      {/* Search & Filters */}
      <div className="p-4 space-y-3" style={{ borderBottom: '1px solid #E0E0E0', backgroundColor: '#FFFFFF' }}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: '#607D8B' }} />
          <input
            type="text"
            placeholder="Search teachers..."
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
                backgroundColor: filter === f ? '#2563EB' : '#E0E0E0',
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

      {/* Teacher List */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain bg-white">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u, idx) => {
            const isSelected = selectedUser ? getUserId(selectedUser) === getUserId(u) : false;
            const unread = unreadCount[getUserId(u)] || 0;
            const courseTitles = getTeacherCourses(u);
            const courseLabel = courseTitles.length > 0 ? courseTitles[0] : (u.subject || "Teacher");
            const courseCountLabel = courseTitles.length > 1 ? ` +${courseTitles.length - 1}` : "";

            return (
              <motion.button
                key={getUserId(u)}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 4 }}
                onClick={() => onSelectUser(u)}
                className="w-full text-left p-3 flex items-center gap-3 transition-all"
                style={{
                  borderBottom: '1px solid #E0E0E0',
                  backgroundColor: isSelected ? '#E8EAF6' : 'transparent',
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
                  {u.avatar ? (
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg" style={{ background: 'linear-gradient(to bottom right, #3F51B5, #5C6BC0)' }}>
                      {u.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>

                {/* Teacher Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate" style={{ color: isSelected ? '#3F51B5' : '#263238' }}>
                    {u.name}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#607D8B' }}>
                    {courseLabel}{courseCountLabel}
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
            <p className="font-semibold">No teachers found</p>
            <p className="text-sm">Try adjusting your filters</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
