import React, { useState, useEffect } from "react";

// TeacherSidebar component
export default function TeacherSidebar({
  teachers,
  selectedTeacher,
  onSelectTeacher,
  searchValue,
  onSearch,
}) {
  const [filter, setFilter] = useState("all"); // all | unread | course
  const [selectedCourse, setSelectedCourse] = useState("");

  // Extract unique courses
  const courses = [...new Set(teachers.map((t) => t.subject))];

  // Filtered list based on search and filter
  const filteredTeachers = teachers.filter((teacher) => {
    // Search filter
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      teacher.subject.toLowerCase().includes(searchValue.toLowerCase());

    // Filter type
    let matchesFilter = true;
    if (filter === "unread") {
      matchesFilter = teacher.unread && teacher.unread > 0;
    } else if (filter === "course") {
      matchesFilter = selectedCourse ? teacher.subject === selectedCourse : true;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 border-r bg-gray-100 flex flex-col">
      {/* Search */}
      <div className="p-4 border-b space-y-2">
        <input
          type="text"
          className="input input-bordered w-full"
          placeholder="Search teachers..."
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mt-2">
          {["all", "unread", "course"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${filter === f ? "btn-primary" : "btn-outline"
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Course selection if filter === course */}
        {filter === "course" && (
          <div className="flex gap-2 flex-wrap mt-2">
            <button
              className={`btn btn-sm ${selectedCourse === "" ? "btn-primary" : "btn-outline"}`}
              onClick={() => setSelectedCourse("")}
            >
              All
            </button>
            {courses.map((course) => (
              <button
                key={course}
                className={`btn btn-sm ${selectedCourse === course ? "btn-primary" : "btn-outline"}`}
                onClick={() => setSelectedCourse(course)}
              >
                {course}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Teacher List */}
      <div className="flex-1 overflow-y-auto">
        {filteredTeachers.length > 0 ? (
          filteredTeachers.map((teacher) => (
            <button
              key={teacher._id}
              onClick={() => onSelectTeacher(teacher)}
              className={`w-full text-left p-3 border-b flex items-center gap-3 ${selectedTeacher?._id === teacher._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-200"
                }`}
            >
{/* Avatar */}
{teacher.avatar ? (
  <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden">
    <img 
      src={teacher.avatar} 
      alt={teacher.name} 
      className="w-full h-full object-cover"
      onError={(e) => {
        e.target.style.display = 'none';
        // Optionally show fallback initials
      }}
    />
  </div>
) : (
  <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
    {teacher.name.charAt(0)}
  </div>
)}
              {/* <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                {teacher.name.charAt(0)}
              </div> */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{teacher.name}</p>
                <p className="text-xs text-gray-500 truncate">{teacher.subject}</p>
              </div>
              {teacher.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {teacher.unread}
                </div>
              )}
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 p-4">No teachers found</p>
        )}
      </div>
    </div>
  );
}
