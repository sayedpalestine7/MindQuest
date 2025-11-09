"use client"
import React, { useState , useEffect } from "react"
import Header from "../components/profiles/student/Header"
import ProfileHeader from "../components/profiles/student/ProfileHeader"
import ProgressOverview from "../components/profiles/student/ProgressOverview"
import EnrolledCourses from "../components/profiles/student/EnrolledCourses"
// import RecentActivity from "../components/profiles/student/RecentActivity"
// import Achievements from "../components/profiles/student/Achievements"
import EditProfileModal from "../components/profiles/student/EditProfileModal"
import { motion } from "framer-motion"

export default function StudentProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profileData, setProfileData] = useState(null)
  const [editForm, setEditForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const studentId = localStorage.getItem("userId")
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/student/id/${studentId}`)
        if (!res.ok) throw new Error("Failed to fetch student data")
        const data = await res.json()

        setProfileData({
          name: data.name,
          email: data.email,
          avatar: data.profileImage || "/student-avatar.png",
          score: data.studentData?.score ?? 0,
          finishedCourses: data.studentData?.finishedCourses ?? 0,
        })
        setEditForm({
          name: data.name,
          email: data.email,
          avatar: data.profileImage || "/student-avatar.png",
          password: "",
        })
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStudentData()
  }, [studentId])


  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", thumbnail: "/web-development-course.png", progress: 75, totalLessons: 12, completedLessons: 9 },
    { id: 2, title: "Advanced JavaScript Concepts", thumbnail: "/javascript-course.png", progress: 45, totalLessons: 15, completedLessons: 7 },
    { id: 3, title: "React Fundamentals", thumbnail: "/react-course.png", progress: 90, totalLessons: 10, completedLessons: 9 },
    { id: 4, title: "Python for Data Science", thumbnail: "/python-data-science.png", progress: 30, totalLessons: 20, completedLessons: 6 },
  ]


  const stats = profileData
    ? {
      totalCourses: enrolledCourses.length,
      completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
      totalPoints: profileData.score || 0,
      overallProgress: Math.round(
        enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length
      ),
    }
    : {}

const handleSaveProfile = async () => {
  try {
    const studentId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const response = await fetch(`http://localhost:5000/api/student/id/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: editForm.name,
        email: editForm.email,
        password: editForm.password,
        avatar: editForm.avatar,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Failed to update profile");
      return;
    }

    // ✅ Update frontend state
    setProfileData({
      name: data.student.name,
      email: data.student.email,
      avatar: data.student.avatar,
    });

    alert("Profile updated successfully!");
    setIsEditModalOpen(false);

  } catch (err) {
    console.error("Error updating profile:", err);
    alert("Server error while updating profile");
  }
};

  if (loading) return <div className="p-8 text-center">Loading profile...</div>
  if (error) return <div className="p-8 text-center text-red-600">Error: {error}</div>

  return (
    <div className="min-h-screen bg-gray-50">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Header onLogout={() => alert("Logged out")} />

        <div className="container mx-auto p-6 space-y-8 max-w-7xl">
          <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditModalOpen(true)} />
          <ProgressOverview stats={stats} />
          <div className="">

            <div className="lg:col-span-2 space-y-6">
              <EnrolledCourses courses={enrolledCourses} />
            </div>
          </div>
        </div>

        {isEditModalOpen && (
          <EditProfileModal
            editForm={editForm}
            setEditForm={setEditForm}
            onCancel={() => setIsEditModalOpen(false)}
            onSave={handleSaveProfile}
          />
        )}
      </motion.div>
    </div>
  )
}
