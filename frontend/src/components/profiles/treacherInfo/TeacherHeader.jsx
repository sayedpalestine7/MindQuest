import React from "react";

export default function TeacherHeader({ teacher }) {
  return (
    <div className="bg-white rounded-lg p-8 mb-8 shadow">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-full border-4 border-blue-300 overflow-hidden">
            <img
              src={teacher.avatar || "/placeholder.svg"}
              alt={teacher.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold">{teacher.name}</h1>
              <p className="text-lg text-gray-500 mb-3">{teacher.title}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div>{teacher.location}</div>
                <div>Member since {teacher.memberSince}</div>
                <div>{teacher.email}</div>
              </div>
            </div>

            <button className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2">
              Contact
            </button>
          </div>

          <p className="mb-6">{teacher.bio}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.stats.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.stats.courses}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.stats.rating}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.stats.reviews.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
