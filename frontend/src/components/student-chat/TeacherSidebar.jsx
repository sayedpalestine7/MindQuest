import { useState, useEffect } from "react";
import { io } from "socket.io-client";

let socket;

export default function TeacherSidebar({
  users = [],
  selectedUser,
  onSelectUser,
  searchValue,
  onSearch,
  currentUserId,
}) {
  const [filter, setFilter] = useState("all");
  const [courseFilter, setCourseFilter] = useState("");
  const [usersList, setUsersList] = useState(users);

  useEffect(() => setUsersList(users), [users]);

  const getTeacherId = (t) => t._id ?? t.id;

  // Connect socket
  useEffect(() => {
    if (!currentUserId) return;
    socket = io("http://localhost:5000");
    socket.emit("join_room", { roomId: currentUserId });

    socket.on("new_message", (msg) => {
      setUsersList((prev) =>
        prev.map((u) =>
          u._id === msg.senderId || u._id === msg.receiverId
            ? { ...u, unread: (u.unread || 0) + 1 }
            : u
        )
      );
    });

    return () => socket.disconnect();
  }, [currentUserId]);

  const courses = [...new Set(usersList.map((u) => u.subject).filter(Boolean))];

  const filteredUsers = usersList.filter((u) => {
    const name = u.name || "";
    const subject = u.subject || "";
    const matchesSearch =
      name.toLowerCase().includes((searchValue || "").toLowerCase()) ||
      subject.toLowerCase().includes((searchValue || "").toLowerCase());
    let matchesFilter = true;
    if (filter === "unread") matchesFilter = u.unread && u.unread > 0;
    else if (filter === "course") matchesFilter = courseFilter ? u.subject === courseFilter : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 border-r bg-gray-100 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b space-y-3">
        <input
          type="text"
          placeholder="Search teachers..."
          className="input input-bordered w-full"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />

        {/* Filters */}
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

      {/* Teacher List */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((u) => {
            const getUserId = (user) => user._id ?? user.id;
            const isSelected = selectedUser ? getUserId(selectedUser) === getUserId(u) : false;

            return (
              <button
                key={getUserId(u)}
                onClick={() => {
                  onSelectUser(u);
                  setUsersList((prev) =>
                    prev.map((uu) => (getUserId(uu) === getUserId(u) ? { ...uu, unread: 0 } : uu))
                  );
                }}
                className={`
            w-full text-left p-3 border-b flex items-center gap-3 transition-colors
            ${isSelected
                    ? "!bg-blue-100 !text-black cursor-default"
                    : "hover:!bg-gray-200 cursor-pointer"}
          `}
              >
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                  {u.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold truncate ${isSelected ? "text-blue-700" : ""}`}>
                    {u.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{u.subject || ""}</p>
                </div>
                {u.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {u.unread}
                  </div>
                )}
              </button>
            );
          })
        ) : (
          <p className="text-center text-gray-500 p-4">No teachers found</p>
        )}
      </div>
    </div>
  );
}
