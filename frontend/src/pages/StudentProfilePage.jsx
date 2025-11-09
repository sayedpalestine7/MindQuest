"use client"
import React, { useState, useEffect } from "react";
import Header from "../components/profiles/student/Header";
import ProfileHeader from "../components/profiles/student/ProfileHeader";
import ProgressOverview from "../components/profiles/student/ProgressOverview";
import EnrolledCourses from "../components/profiles/student/EnrolledCourses";
import EditProfileModal from "../components/profiles/student/EditProfileModal";
import { motion } from "framer-motion";
import axios from "axios";
import toast from "react-hot-toast";

export default function StudentProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem("token");
        const studentId = localStorage.getItem("userId");

        // Check if user is logged in
        if (!token || !studentId) {
          toast.error("Please login first");
          window.location.href = "/login";
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/student/id/${studentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;

        setProfileData({
          _id: data._id,
          name: data.name,
          email: data.email,
          avatar: data.profileImage,
          score: data.studentData?.score ?? 0,
          finishedCourses: data.studentData?.finishedCourses ?? 0,
        });

      } catch (err) {
        console.error("Fetch error:", err);
        
        // Handle authentication errors
        if (err.response?.status === 401 || err.response?.status === 403) {
          toast.error("Session expired. Please login again");
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          window.location.href = "/login";
          return;
        }
        
        setError(err.response?.data?.message || err.message);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, []);

  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", thumbnail: "/web-development-course.png", progress: 75, totalLessons: 12, completedLessons: 9 },
    { id: 2, title: "Advanced JavaScript Concepts", thumbnail: "/javascript-course.png", progress: 45, totalLessons: 15, completedLessons: 7 },
    { id: 3, title: "React Fundamentals", thumbnail: "/react-course.png", progress: 90, totalLessons: 10, completedLessons: 9 },
    { id: 4, title: "Python for Data Science", thumbnail: "/python-data-science.png", progress: 30, totalLessons: 20, completedLessons: 6 },
  ];

  const stats = profileData
    ? {
        totalCourses: enrolledCourses.length,
        completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
        totalPoints: profileData.score || 0,
        overallProgress: Math.round(
          enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length
        ),
      }
    : {};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    toast.success("Logged out successfully");
    window.location.href = "/login";
  };

  const handleProfileUpdate = (updatedData) => {
    // Update profile data with the new information from backend
    setProfileData({
      _id: updatedData._id,
      name: updatedData.name,
      email: updatedData.email,
      avatar: updatedData.profileImage,
      score: updatedData.studentData?.score ?? profileData.score,
      finishedCourses: updatedData.studentData?.finishedCourses ?? profileData.finishedCourses,
    });
    
    // Force a small re-render to ensure UI updates
    setIsEditModalOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-600">No student found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>
        <Header onLogout={handleLogout} />

        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditModalOpen(true)} />
          <ProgressOverview stats={stats} />
          <EnrolledCourses courses={enrolledCourses} />
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            profileData={profileData}
            onClose={() => setIsEditModalOpen(false)}
            onUpdate={handleProfileUpdate}
          />
        )}
      </motion.div>
    </div>
  );
}