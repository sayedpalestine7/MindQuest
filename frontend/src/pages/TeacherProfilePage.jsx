"use client"

import React, { useState } from "react"
import Header from "../components/profiles/teacher/Header.jsx"
import ProfileHeader from "../components/profiles/teacher/ProfileHeader.jsx"
// import StatisticsSection from "./StatisticsSection.jsx"
// import CoursesSection from "./CoursesSection.jsx"
// import RecentActivitySection from "./RecentActivitySection.jsx"
// import QuickActionsSection from "./QuickActionsSection.jsx"
// import EditProfileModal from "./EditProfileModal.jsx"

export default function TeacherProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Dr. Sarah Mitchell",
    email: "sarah.mitchell@mindquest.edu",
    avatar: "/teacher-avatar.jpg",
    title: "Senior Instructor",
    department: "Computer Science",
  })

  const [editForm, setEditForm] = useState({ ...profileData, password: "" })
  const [previewAvatar, setPreviewAvatar] = useState("")

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result
        setPreviewAvatar(result)
        setEditForm({ ...editForm, avatar: result })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSaveProfile = () => {
    setProfileData({
      name: editForm.name,
      email: editForm.email,
      avatar: editForm.avatar,
      title: editForm.title,
      department: editForm.department,
    })
    setIsEditModalOpen(false)
    setPreviewAvatar("")
  }

  const handleLogout = () => {
    alert("Logged out successfully!")
    window.location.href = "/"
  }

  const coursesTaught = [
    { id: 1, title: "Introduction to Web Development", students: 245, rating: 4.8, completionRate: 87, revenue: 12250, status: "active" },
    { id: 2, title: "Advanced JavaScript Concepts", students: 189, rating: 4.9, completionRate: 92, revenue: 9450, status: "active" },
    { id: 3, title: "React Fundamentals", students: 312, rating: 4.7, completionRate: 85, revenue: 15600, status: "active" },
    { id: 4, title: "Python for Data Science", students: 156, rating: 4.6, completionRate: 78, revenue: 7800, status: "draft" },
  ]

  const recentActivity = [
    { id: 1, title: "New 5-star review on React Fundamentals", student: "Alex Johnson", date: "2 hours ago" },
    { id: 2, title: "Student question in Web Development course", student: "Maria Garcia", date: "4 hours ago" },
    { id: 3, title: "15 students completed JavaScript module", student: "Multiple students", date: "1 day ago" },
  ]

  const stats = {
    totalStudents: coursesTaught.reduce((acc, c) => acc + c.students, 0),
    activeCourses: coursesTaught.filter((c) => c.status === "active").length,
    averageRating: (coursesTaught.reduce((acc, c) => acc + c.rating, 0) / coursesTaught.length).toFixed(1),
    totalRevenue: coursesTaught.reduce((acc, c) => acc + c.revenue, 0),
    avgCompletionRate: Math.round(coursesTaught.reduce((acc, c) => acc + c.completionRate, 0) / coursesTaught.length),
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f9fafb" }}>
      <Header onLogout={handleLogout} />
      <div style={{ padding: "2rem", maxWidth: "1200px", margin: "auto" }}>
        <ProfileHeader
          profileData={profileData}
          stats={stats}
          onEdit={() => setIsEditModalOpen(true)}
        />
    </div>
    </div>
  )
}
