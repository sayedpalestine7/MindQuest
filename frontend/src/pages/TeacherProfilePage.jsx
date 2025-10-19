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

  return (
    <>
    <Header/>
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
    </motion.div>
    </>
  )
}
