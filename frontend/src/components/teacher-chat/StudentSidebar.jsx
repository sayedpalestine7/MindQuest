import { useState, useEffect } from "react";

export default function StudentSidebar({
  students = [],
  selectedStudent,
  onSelectStudent,
  searchValue,
  onSearch,
  socket,
  teacherId,
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
      // Only increment unread if the message is from this student to this teacher
      if (msg.sender === "student" && msg.studentId && msg.teacherId === teacherId) {
        setStudentsList((prev) =>
          prev.map((s) =>
            getStudentId(s) === msg.studentId
              ? { ...s, unread: (s.unread || 0) + 1 }
              : s
          )
        );
      }
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, teacherId]);

  // Reset unread when student is selected
  useEffect(() => {
    if (!selectedStudent) return;

    const studentRoomId = `${teacherId}_${getStudentId(selectedStudent)}`;
    socket?.emit("join_room", { roomId: studentRoomId });

    setStudentsList((prev) =>
      prev.map((s) =>
        getStudentId(s) === getStudentId(selectedStudent) ? { ...s, unread: 0 } : s
      )
    );

    return () => {
      socket?.emit("leave_room", { roomId: studentRoomId });
    };
  }, [selectedStudent, socket, teacherId]);

  const courses = [...new Set(studentsList.map((s) => s.subject).filter(Boolean))];

  const filteredStudents = studentsList.filter((s) => {
    const matchesSearch =
      s.name?.toLowerCase().includes(searchValue.toLowerCase()) ||
      s.subject?.toLowerCase().includes(searchValue.toLowerCase());

    let matchesFilter = true;
    if (filter === "unread") matchesFilter = s.unread && s.unread > 0;
    else if (filter === "course") matchesFilter = courseFilter ? s.subject === courseFilter : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 border-r bg-gray-100 flex flex-col">
      {/* Search & Filters */}
      <div className="p-4 border-b space-y-3">
        <input
          type="text"
          placeholder="Search students..."
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
            {courses.map((c) => (
              <button
                key={c}
                className={`btn btn-sm ${courseFilter === c ? "btn-primary" : "btn-outline"}`}
                onClick={() => setCourseFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student List */}
      <div className="flex-1 overflow-y-auto">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((s) => {
            const isSelected =
              selectedStudent && getStudentId(selectedStudent) === getStudentId(s);

            return (
              <button
                key={getStudentId(s)}
                onClick={() => onSelectStudent(s)}
                className={`w-full text-left p-3 border-b flex items-center gap-3 transition-colors ${
                  isSelected
                    ? "!bg-blue-200 !text-black cursor-default"
                    : "hover:!bg-blue-100 cursor-pointer"
                }`}
              >
                {/* here lets see the the image part */}
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden">
                  {s.avatar ? (
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-gray-600 font-semibold">
                      {s.name?.charAt(0) ?? "?"}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isSelected ? "text-blue-700" : ""}`}>
                    {s.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{s.subject}</p>
                </div>
                {s.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {s.unread}
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <p className="text-center text-gray-500 p-4">No students found</p>
        )}
      </div>
    </div>
  );
}
