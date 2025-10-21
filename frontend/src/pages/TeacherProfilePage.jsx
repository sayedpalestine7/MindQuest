"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import ProfileHeader from "../components/profiles/teacher/ProfileHeader"
import Header from "../components/profiles/teacher/Header"
import StatsSection from "../components/profiles/teacher/StatsSection"
import CoursesSection from "../components/profiles/teacher/CoursesSection"
import PerformanceSection from "../components/profiles/teacher/PerformanceSection"
import EditProfileDialog from "../components/profiles/teacher/EditProfileDialog"

export default function TeacherProfilePage() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [profileData, setProfileData] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    avatar: "/student-avatar.png",
  })
  return (
    
    <div className="min-h-screen bg-gray-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <Header onLogout={() => alert("Logged out")} />
    
          {/* <div className="container mx-auto p-6 space-y-8 max-w-7xl">
            <ProfileHeader profileData={profileData} stats={stats} onEdit={() => setIsEditModalOpen(true)} />
            <ProgressOverview stats={stats} />
            <div className="">
              
              <div className="lg:col-span-2 space-y-6">
                
                <RecentActivity activities={activities} />
                <EnrolledCourses courses={enrolledCourses} />
              </div>
              <Achievements badges={badges} />
            </div>
          </div> */}
  
          </motion.div>
              {/* <Header/>
    <motion.div
      className="min-h-screen bg-gray-50 p-6 space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    > 
      
      <ProfileHeader onEdit={() => setIsEditOpen(true)} />

      <StatsSection />

      <CoursesSection />

      <PerformanceSection />

      <EditProfileDialog open={isEditOpen} onClose={() => setIsEditOpen(false)} />
    </motion.div> */}
        </div>


  )
}
