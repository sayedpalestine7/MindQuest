import { useState, useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export default function StudentSidebar({
  students,
  selectedTeacher,
  onSelectStudent,
  searchValue,
  onSearch,
  studentId,
}) {
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [teachersList, setTeachersList] = useState(students);

  useEffect(() => {
    // Connect socket
    socket = io("http://localhost:5000"); // adjust URL if needed
    socket.emit("join_room", { roomId: studentId }); // join student room

    socket.on("new_message", (msg) => {
      // If the message is from one of the teachers, mark hasMessages
      setTeachersList((prev) =>
        prev.map((t) =>
          t._id === msg.senderId || t._id === msg.receiverId
            ? { ...t, hasMessages: true, unread: (t.unread || 0) + 1 }
            : t
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => setTeachersList(students), [students]);

  // Filter logic
  const courses = [...new Set(teachersList.map((t) => t.subject).filter(Boolean))];
  const filteredTeachers = teachersList.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      t.subject?.toLowerCase().includes(searchValue.toLowerCase());
    let matchesFilter = true;
    if (filter === "unread") matchesFilter = t.unread && t.unread > 0;
    else if (filter === "course") matchesFilter = courseFilter ? t.subject === courseFilter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 border-r bg-gray-100 flex flex-col">
      {/* Search & Filters */}
      <div className="p-4 border-b space-y-3">
        <input
          type="text"
          placeholder="Search teachers..."
          className="input input-bordered w-full"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />
        <div className="flex gap-2 flex-wrap mt-2">
          {["all", "unread", "course"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filter === "course" && (
          <div className="flex gap-2 flex-wrap mt-2">
            <button
              className={`btn btn-sm ${courseFilter === "" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setCourseFilter("")}
            >
              All
            </button>
            {courses.map((course) => (
              <button
                key={course}
                className={`btn btn-sm ${courseFilter === course ? "btn-primary" : "btn-outline"}`}
                onClick={() => setCourseFilter(course)}
              >
                {course}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Teacher List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTeachers.map((t) => (
          <button
            key={t._id}
            onClick={() => {
              onSelectStudent(t);
              // reset unread
              setTeachersList((prev) =>
                prev.map((tt) => (tt._id === t._id ? { ...tt, unread: 0 } : tt))
              );
            }}
            className={`w-full text-left p-3 border-b flex items-center gap-3 ${
              selectedTeacher?._id === t._id ? "bg-blue-100" : "hover:bg-gray-200"
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
              {t.name?.charAt(0) ?? "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{t.name}</p>
              <p className="text-xs text-gray-500 truncate">{t.subject}</p>
            </div>
            {t.unread > 0 && (
              <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                {t.unread}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
