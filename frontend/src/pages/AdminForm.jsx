import Sidebar from '../components/Admin/Sidebar.jsx'
import Dashboard from '../components/Admin/Dashboard.jsx'
import StatCard from '../components/Admin/StatCard.jsx'
import { Users, BookOpen, GraduationCap, CheckCircle } from "lucide-react"
import { motion } from "framer-motion";
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react";
import axios from "axios"


function AdminForm() {
  const [stats, setStats] = useState([
    { title: "Total Users", value: 0, icon: Users, index: 0, trend: { value: 0, isPositive: true } },
    { title: "Courses", value: 0, icon: BookOpen, index: 1, trend: { value: 0, isPositive: true } },
    { title: "Active Students", value: 0, icon: GraduationCap, index: 2, trend: { value: 0, isPositive: true } },
    { title: "Approved Courses", value: 0, icon: CheckCircle, index: 3, trend: { value: 0, isPositive: true } },
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = token ? { Authorization: `Bearer ${token}` } : {}
        
        // Fetch users summary
        const usersRes = await axios.get("http://localhost:5000/api/admin/users/summary", { headers })
        const totalUsers = usersRes.data?.totalUsers || 0
        const activeStudents = usersRes.data?.activeStudents || 0
        
        // Fetch courses with limit=all to get all courses without pagination
        const coursesRes = await axios.get("http://localhost:5000/api/courses?limit=all", { headers })
        const allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : coursesRes.data.courses || []
        const totalCourses = allCourses.length
        const approvedCourses = allCourses.filter(c => c.approvalStatus === "approved").length
        
        setStats([
          { title: "Total Users", value: totalUsers, icon: Users, index: 0, trend: { value: 0, isPositive: true } },
          { title: "Courses", value: totalCourses, icon: BookOpen, index: 1, trend: { value: 0, isPositive: true } },
          { title: "Active Students", value: activeStudents, icon: GraduationCap, index: 2, trend: { value: 0, isPositive: true } },
          { title: "Approved Courses", value: approvedCourses, icon: CheckCircle, index: 3, trend: { value: 0, isPositive: true } },
        ])
        setLoading(false)
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setLoading(false)
      }
    }
    
    fetchDashboardStats()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">     
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />
        <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Monitor performance, manage users, and keep your courses up to date.
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </motion.div>

        {/* Stat Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 ">
          {loading ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </div>
          ) : (
            stats.map((stat, i) => (
              <StatCard key={i} title={stat.title} value={stat.value} Icon={stat.icon} trend={stat.trend} />
            ))
          )}
        </div>

          <Dashboard />
        </div>
      </div>
    </div>
  )
}

export default AdminForm
