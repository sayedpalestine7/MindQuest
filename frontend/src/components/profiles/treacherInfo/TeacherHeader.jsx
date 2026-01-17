import React from "react";
import { Facebook, Linkedin, Twitter, Github, Globe, Instagram, Youtube } from "lucide-react";

// Helper function to detect social media platform from URL
const getSocialIcon = (url) => {
  const urlLower = url.toLowerCase();
  
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return { Icon: Facebook, color: 'text-blue-600 hover:text-blue-700', name: 'Facebook' };
  }
  if (urlLower.includes('linkedin.com')) {
    return { Icon: Linkedin, color: 'text-blue-700 hover:text-blue-800', name: 'LinkedIn' };
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return { Icon: Twitter, color: 'text-sky-500 hover:text-sky-600', name: 'Twitter' };
  }
  if (urlLower.includes('github.com')) {
    return { Icon: Github, color: 'text-gray-800 hover:text-gray-900', name: 'GitHub' };
  }
  if (urlLower.includes('instagram.com')) {
    return { Icon: Instagram, color: 'text-pink-600 hover:text-pink-700', name: 'Instagram' };
  }
  if (urlLower.includes('youtube.com')) {
    return { Icon: Youtube, color: 'text-red-600 hover:text-red-700', name: 'YouTube' };
  }
  return { Icon: Globe, color: 'text-gray-600 hover:text-gray-700', name: 'Website' };
};

export default function TeacherHeader({ teacher, reviewsCount = 0 }) {
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
                {teacher.experience !== undefined && teacher.experience !== null && (
                  <div>{teacher.experience} yrs experience</div>
                )}
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
              <div className="mb-4 flex items-center gap-3">
                {links.map((url) => {
                  const { Icon, color, name } = getSocialIcon(url);
                  const fullUrl = url.startsWith("http") ? url : `https://${url}`;
                  
                  return (
                    <a
                      key={url}
                      href={fullUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors ${color}`}
                      title={name}
                    >
                      <Icon size={20} />
                    </a>
                  );
                })}
              </div>
            );
          })()}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.totalStudents.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Students</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.courses?.length || 0}</div>
              <div className="text-sm text-gray-500">Courses</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{teacher.rating || "-"}</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
            <div className="p-4 bg-gray-100 rounded text-center">
              <div className="text-xl font-bold">{reviewsCount}</div>

              <div className="text-sm text-gray-500">Reviews</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
