import { useState } from "react";
import StudentListItem from "./StudentListItem";

export default function StudentSidebar({
  students,
  selectedStudent,
  onSelectStudent,
  searchValue,
  onSearch,
}) {
  const [filter, setFilter] = useState("all"); // all | unread | course
  const [courseFilter, setCourseFilter] = useState("");

  // Extract unique courses
  const courses = [...new Set(students.map((s) => s.subject))];

  // Filtered list
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      student.subject.toLowerCase().includes(searchValue.toLowerCase());

    let matchesFilter = true;

    if (filter === "unread") {
      matchesFilter = student.unread && student.unread > 0;
    } else if (filter === "course") {
      matchesFilter = courseFilter
        ? student.subject === courseFilter
        : true;
    }

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-80 border-r bg-gray-100 flex flex-col">

      {/* Search */}
      <div className="p-4 border-b space-y-3">
        <input
          type="text"
          placeholder="Search students..."
          className="input input-bordered w-full"
          value={searchValue}
          onChange={(e) => onSearch(e.target.value)}
        />

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {["all", "unread", "course"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`btn btn-sm ${
                filter === f ? "btn-primary" : "btn-outline"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Course Filter */}
        {filter === "course" && (
          <div className="flex gap-2 flex-wrap mt-2">
            <button
              className={`btn btn-sm ${
                courseFilter === "" ? "btn-primary" : "btn-outline"
              }`}
              onClick={() => setCourseFilter("")}
            >
              All
            </button>

            {courses.map((course) => (
              <button
                key={course}
                className={`btn btn-sm ${
                  courseFilter === course ? "btn-primary" : "btn-outline"
                }`}
                onClick={() => setCourseFilter(course)}
              >
                {course}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Students List */}
      <div className="flex-1 overflow-y-auto">
        {filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
            <button
              key={student._id}
              onClick={() => onSelectStudent(student)}
              className={`w-full text-left p-3 border-b flex items-center gap-3 ${
                selectedStudent?._id === student._id
                  ? "bg-blue-100"
                  : "hover:bg-gray-200"
              }`}
            >
              {/* Avatar */}
              {student.avatar ? (
                <img
                  src={student.avatar}
                  className="w-10 h-10 rounded-full object-cover"
                  alt={student.name}
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-500 flex items-center justify-center text-white font-bold">
                  {student.name.charAt(0)}
                </div>
              )}

              <div className="flex-1">
                <p className="font-semibold truncate">{student.name}</p>
                <p className="text-xs text-gray-500 truncate">
                  {student.subject}
                </p>
              </div>

              {student.unread > 0 && (
                <div className="w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                  {student.unread}
                </div>
              )}
            </button>
          ))
        ) : (
          <p className="text-center text-gray-500 p-4">
            No students found
          </p>
        )}
      </div>
    </div>
  );
}
