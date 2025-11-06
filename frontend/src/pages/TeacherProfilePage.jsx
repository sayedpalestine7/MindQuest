"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { BookOpen, Users, Star, Award } from "lucide-react";

import ProfileHeader from "../components/profiles/teacher/ProfileHeader";
import Header from "../components/profiles/teacher/Header";
import StatsSection from "../components/profiles/teacher/StatsSection";
import CoursesSection from "../components/profiles/teacher/CoursesSection";
import PerformanceSection from "../components/profiles/teacher/PerformanceSection";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";

export default function TeacherProfilePage() {
  
  const { id } = useParams();

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);


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

  // ✅ Construct stats safely
const stats = {
  totalCourses: profileData.totalCourses || 0,
  totalStudents: profileData.totalStudents || 0,
  rating: profileData.rating?.toFixed(1) || "0.0",
  totalPoints: profileData.totalPoints || 0,
};
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // redirect after logout
  };

  // ✅ Temporary — until you connect courses API
  const teacherCourses = [
    { title: "Intro to AI", status: "active", enrolledStudents: 120, rating: 4.8 },
    { title: "Deep Learning", status: "active", enrolledStudents: 80, rating: 4.9 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
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
      </motion.div>
    </div>
  );
}
