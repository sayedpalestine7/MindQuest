"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router";

import ProfileHeader from "../components/profiles/teacher/ProfileHeader";
import Header from "../components/profiles/teacher/Header";
import StatsSection from "../components/profiles/teacher/StatsSection";
import CoursesSection from "../components/profiles/teacher/CoursesSection";
import PerformanceSection from "../components/profiles/teacher/PerformanceSection";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";

import TeacherCommunicationCenter from "../pages/TeacherCommunicationCenter.jsx";

export default function TeacherProfilePage() {
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/teacher/id/${id}`);
        if (!res.ok) throw new Error("Failed to fetch teacher data");
        const data = await res.json();
        setProfileData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id]);

  if (loading) return <div className="text-center py-10 text-lg">Loading...</div>;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!profileData) return <div className="text-center py-10">No teacher found</div>;

  const stats = {
    totalCourses: profileData.totalCourses || 0,
    totalStudents: profileData.totalStudents || 0,
    rating: profileData.rating?.toFixed(1) || "0.0",
    totalPoints: profileData.totalPoints || 0,
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const teacherCourses = [
    { title: "Intro to AI", status: "active", enrolledStudents: 120, rating: 4.8 },
    { title: "Deep Learning", status: "active", enrolledStudents: 80, rating: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        {/* Page Header */}
        <Header onLogout={handleLogout} />

        {/* Profile Info Section */}
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader
            profileData={{
              name: profileData.name,
              email: profileData.email,
              avatar: profileData.avatar,
            }}
            stats={stats}
            onEdit={() => setIsEditOpen(true)}
          />

          {/* FAB Floating Messages Button */}
          <motion.button
            onClick={() => setIsChatOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-8 right-8 z-40 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full shadow-lg font-semibold flex items-center gap-2 transition-colors"
          >
            <span>💬</span> Messages
          </motion.button>

          {/* Teacher Details Sections */}
          <PerformanceSection stats={stats} />
          <StatsSection stats={stats} />
          <CoursesSection courses={teacherCourses} />
        </div>

        {/* Edit Profile Modal */}
        <EditProfileDialog
          open={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          profileData={profileData}
          setProfileData={setProfileData}
        />

        {/* Messaging Modal */}
        {isChatOpen && (
          <div className="modal modal-open">
            <div className="modal-box p-0 overflow-hidden 
                            w-[90vw] max-w-3xl h-[80vh] 
                            flex flex-col">

              {/* Top Bar */}
              <div className="flex justify-between items-center p-4 border-b bg-gray-100">
                <h3 className="font-semibold text-lg">Teacher Messaging Center</h3>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => setIsChatOpen(false)}
                >
                  Close
                </button>
              </div>

              {/* Chat Body (Fixed Size Area) */}
              <div className="flex-1 overflow-hidden">
                <TeacherCommunicationCenter />
              </div>
            </div>

            {/* Clicking outside closes modal */}
            <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}></div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
