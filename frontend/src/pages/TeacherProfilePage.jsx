"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ProfileHeader from "../components/profiles/teacher/ProfileHeader";
import Header from "../components/profiles/teacher/Header";
import StatsSection from "../components/profiles/teacher/StatsSection";
import CoursesSection from "../components/profiles/teacher/CoursesSection";
import PerformanceSection from "../components/profiles/teacher/PerformanceSection";
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog";

export default function TeacherProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
  name: "Alex Johnson",
  email: "alex.johnson@example.com",
  password: "",
  avatar: "/teacher-avatar.png",
  specialization: "Machine Learning",
  experience: 5,
  bio: "Dedicated educator with 5+ years of experience in teaching AI and data science.",
  phone: "+970-599-123456",
  linkedin: "https://linkedin.com/in/alexjohnson",
});


  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/teacher-avatar.png",
  });

  // ✅ Sample fake teacher courses
  const teacherCourses = [
    { title: "Intro to AI", status: "active", enrolledStudents: 120, rating: 4.8 },
    { title: "Deep Learning", status: "active", enrolledStudents: 80, rating: 4.9 },
    { title: "Web Dev 101", status: "archived", enrolledStudents: 150, rating: 4.5 },
    { title: "Database Design", status: "active", enrolledStudents: 90, rating: 4.6 },
  ];

  // ✅ Teacher stats
  const stats = {
    totalCourses: teacherCourses.length,
    activeCourses: teacherCourses.filter((c) => c.status === "active").length,
    totalStudents: teacherCourses.reduce((sum, c) => sum + c.enrolledStudents, 0),
    averageRating: (
      teacherCourses.reduce((sum, c) => sum + c.rating, 0) / teacherCourses.length
    ).toFixed(1),
    overallEngagement: Math.round(
      (
        (teacherCourses.reduce((sum, c) => sum + c.enrolledStudents * c.rating, 0) /
          teacherCourses.reduce((sum, c) => sum + c.enrolledStudents, 0)) *
        20
      ).toFixed(2)
    ),
    totalPoints: 1250, // Added for ProfileHeader
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Header onLogout={() => alert("Logged out")} />

        {/* Profile Header */}
        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader
            profileData={profileData}
            stats={stats}
            onEdit={() => setIsEditOpen(true)}
          />
          {/* Stats, Courses & Performance Sections */}
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
