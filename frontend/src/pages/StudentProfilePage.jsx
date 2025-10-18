"use client"
import React, { useState } from "react"
import Header from "../components/profiles/student/Header"
import ProfileHeader from "../components/profiles/student/ProfileHeader"
import ProgressOverview from "../components/profiles/student/ProgressOverview"
import EnrolledCourses from "../components/profiles/student/EnrolledCourses"
import RecentActivity from "../components/profiles/student/RecentActivity"
import Achievements from "../components/profiles/student/Achievements"
import EditProfileModal from "../components/profiles/student/EditProfileModal"

export default function StudentProfilePage() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/student-avatar.png",
  })

  const [editForm, setEditForm] = useState({ ...profileData, password: "" })

  const enrolledCourses = [
    { id: 1, title: "Introduction to Web Development", thumbnail: "/web-development-course.png", progress: 75, totalLessons: 12, completedLessons: 9 },
    { id: 2, title: "Advanced JavaScript Concepts", thumbnail: "/javascript-course.png", progress: 45, totalLessons: 15, completedLessons: 7 },
    { id: 3, title: "React Fundamentals", thumbnail: "/react-course.png", progress: 90, totalLessons: 10, completedLessons: 9 },
    { id: 4, title: "Python for Data Science", thumbnail: "/python-data-science.png", progress: 30, totalLessons: 20, completedLessons: 6 },
  ]

  const badges = [
    { id: 1, name: "First Steps", description: "Completed your first lesson", earned: true },
    { id: 2, name: "Century Club", description: "Earned 100 points", earned: true },
    { id: 3, name: "Top Performer", description: "Ranked in top 10%", earned: true },
    { id: 4, name: "Course Master", description: "Completed 5 courses", earned: false },
  ]

  const activities = [
    { id: 1, title: "Completed Quiz in Data Structures", points: 50, date: "2 hours ago" },
    { id: 2, title: "Finished Lesson: Advanced Arrays", points: 25, date: "5 hours ago" },
    { id: 3, title: "Earned Badge: Top Performer", points: 100, date: "1 day ago" },
  ]

  const stats = {
    totalCourses: enrolledCourses.length,
    completedCourses: enrolledCourses.filter((c) => c.progress === 100).length,
    totalPoints: 1250,
    overallProgress: Math.round(enrolledCourses.reduce((a, c) => a + c.progress, 0) / enrolledCourses.length),
  }

  const handleSaveProfile = () => {
    setProfileData({ name: editForm.name, email: editForm.email, avatar: editForm.avatar })
    setIsEditModalOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onLogout={() => alert("Logged out")} />

      <div className="container mx-auto p-6 space-y-8 max-w-7xl">
        <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditModalOpen(true)} />
        <ProgressOverview stats={stats} />
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <EnrolledCourses courses={enrolledCourses} />
            <RecentActivity activities={activities} />
          </div>
          <Achievements badges={badges} />
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
    </div>
  )
}
