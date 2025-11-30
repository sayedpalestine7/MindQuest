import { useState } from "react"
import StudentListItem from "./StudentListItem"

export default function StudentSidebar({
  students,
  selectedStudent,
  onSelectStudent,
  onToggleFavorite,
  filterType,
  setFilterType,
  searchQuery,
  setSearchQuery,
  selectedCourse,
  setSelectedCourse,
}) {
  const courses = [...new Set(students.map(s => s.course))]

  return (
    <div className="w-full md:w-80 border-r bg-base-200 flex flex-col">
      
      {/* Search */}
      <div className="p-4 border-b space-y-3">
        <label className="input input-bordered flex items-center gap-2">
          <input 
            type="text" 
            className="grow" 
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap">
          {['all','unread','favorites','course'].map(ft => (
            <button
              key={ft}
              onClick={() => setFilterType(ft)}
              className={`btn btn-sm ${filterType === ft ? 'btn-primary' : ''}`}
            >
              {ft}
            </button>
          ))}
        </div>

        {/* Course filter */}
        {filterType === "course" && (
          <div className="flex gap-2 flex-wrap">
            <button 
              className={`btn btn-sm ${selectedCourse === '' ? 'btn-primary' : ''}`}
              onClick={() => setSelectedCourse("")}
            >
              All
            </button>

            {courses.map(course => (
              <button 
                key={course}
                className={`btn btn-sm ${selectedCourse === course ? 'btn-primary' : ''}`}
                onClick={() => setSelectedCourse(course)}
              >
                {course}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Student list */}
      <div className="flex-1 overflow-y-auto">
        {students.length ? (
          students.map(student => (
            <StudentListItem
              key={student.id}
              student={student}
              isSelected={selectedStudent?.id === student.id}
              onSelect={() => onSelectStudent(student)}
              onToggleFavorite={() => onToggleFavorite(student.id)}
            />
          ))
        ) : (
          <p className="text-center text-gray-500 p-4">No students found</p>
        )}
      </div>
    </div>
  )
}
