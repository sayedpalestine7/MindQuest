import Sidebar from '../components/Admin/Sidebar.jsx'
import Dashboard from '../components/Admin/Dashboard.jsx'
import StatCard from '../components/Admin/StatCard.jsx'
import { Users, BookOpen, Settings, GraduationCap } from "lucide-react"
import { motion } from "framer-motion";

function AdminForm() {
  // Example data for the StatCards
  const stats = [
    { title: "Total Users", value: 1234, icon: Users, index: 0, trend: { value: 4.5, isPositive: true } },
    { title: "Courses", value: 56, icon: BookOpen, index: 1, trend: { value: 2.1, isPositive: false } },
    { title: "Active Students", value: 789, icon: GraduationCap, index: 2, trend: { value: 6.3, isPositive: true } },
    { title: "Settings Changed", value: 12, icon: Settings, index: 3, trend: { value: 1.5, isPositive: false } },
  ]

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">

      <Sidebar />


      <div className="flex-1 p-8">
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
          {stats.map((stat, i) => (
            <StatCard key={i} title={stat.title} value={stat.value} Icon={stat.icon} trend={stat.trend} />
          ))}
        </div>

        <Dashboard />
      </div>
    </div>
  )
}

export default AdminForm
