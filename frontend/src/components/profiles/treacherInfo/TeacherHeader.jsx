import React from "react";

export default function TeacherHeader({ teacher }) {
  if (!teacher) return <p className="">no teacher what that name</p>;
  return (
    <div className=" container mx-auto px-6 py-8 max-w-7xl ">
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
          </div>

          <p className="mb-2">{teacher.bio}</p>

          {teacher.link && (() => {
            const links = String(teacher.link)
              .split(/[,\s]+/)
              .map((l) => l.trim())
              .filter(Boolean);

            return (
              <div className="mb-4 space-x-3 space-y-1">
                {links.map((url) => (
                  <a
                    key={url}
                    href={url.startsWith("http") ? url : `https://${url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-blue-600 hover:underline text-sm mr-3"
                  >
                    {url}
                  </a>
                ))}
              </div>
            );
          })()}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.courses.length}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.rating || "-"}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.reviews.length}</div>

              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
