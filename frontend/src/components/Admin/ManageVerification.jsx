import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import TeacherCard from "./teacher/TeacherCard.jsx"
import TeacherStats from "./teacher/TeacherStats.jsx"
import TeacherDialog from "./teacher/TeacherDialog.jsx"
import ConfirmDialog from "./teacher/ConfirmDialog.jsx"
import Sidebar from './Sidebar.jsx'
import { Loader2 } from "lucide-react"

// import PendingTeachers from './teacher/PendingTeachers.jsx'

function ManageQuizzes() {
  const [teachers, setTeachers] = useState([])
  const [filteredTeachers, setFilteredTeachers] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [selectedTeacher, setSelectedTeacher] = useState(null)
  const [viewCertificates, setViewCertificates] = useState(false)
  const [actionDialog, setActionDialog] = useState({
    open: false,
    teacher: null,
    action: null,
  })

  useEffect(() => {
    fetchPendingTeachers()
  }, [])

  useEffect(() => {
    const filtered = teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.specialization.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTeachers(filtered)
  }, [searchQuery, teachers])

  // ✅ Using fake teacher data instead of API
  const fetchPendingTeachers = async () => {
    setLoading(true)
    try {
      // Simulate API delay
      await new Promise((res) => setTimeout(res, 600))

      const fakeTeachers = [
        {
          id: 1,
          name: "Alice Johnson",
          email: "alice.johnson@example.com",
          specialization: "Algorithms",
          certificates: [
            "https://i.pravatar.cc/150?img=1"
          ],
          experience: "5 years of teaching experience in data structures",
        },
        {
          id: 2,
          name: "Bob Smith",
          email: "bob.smith@example.com",
          specialization: "Software Engineering",
          certificates: [
            "https://i.pravatar.cc/150?img=2"
          ],
          experience: "7 years of professional software development",
        },
        {
          id: 3,
          name: "Charlie Brown",
          email: "charlie.brown@example.com",
          specialization: "Database Systems",
          certificates: [
            "https://i.pravatar.cc/150?img=3"
          ],
          experience: "Taught SQL and NoSQL courses for 4 years",
        },
        {
          id: 4,
          name: "Diana Prince",
          email: "diana.prince@example.com",
          specialization: "Artificial Intelligence",
          certificates: [
            "https://i.pravatar.cc/150?img=4"
          ],
          experience: "Research assistant in AI at university level",
        },
      ];

      setTeachers(fakeTeachers)
      setFilteredTeachers(fakeTeachers)
    } catch (err) {
      alert("Failed to load mock data")
    } finally {
      setLoading(false)
    }
  }

  // Mock handler for approve/reject actions
  const handleAction = async (teacherId, action) => {
    try {
      // Simulate a short delay
      await new Promise((res) => setTimeout(res, 400))
      alert(`Teacher ${action}d successfully`)
      setTeachers(teachers.filter((t) => t.id !== teacherId))
      setActionDialog({ open: false, teacher: null, action: null })
    } catch (err) {
      alert(`Failed to ${action} teacher`)
    }
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Sidebar />

      <main className="flex-1 p-8">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Teacher Verification
          </h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
            Review and approve pending teacher applications
          </p>
          <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-neutral-300 to-transparent dark:via-neutral-700" />
        </motion.div>

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, or specialization..."
            className="w-full border border-gray-700 rounded px-4 py-2 pl-9 bg-gray-900"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Stats */}
        <TeacherStats teachers={teachers} filteredTeachers={filteredTeachers} />

        {/* Teachers */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12 border rounded bg-white">
            No pending teacher applications found.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredTeachers.map((teacher) => (
              <TeacherCard
                key={teacher.id}
                teacher={teacher}
                onView={() => {
                  setSelectedTeacher(teacher)
                  setViewCertificates(true)
                }}
                onAction={(action) => setActionDialog({ open: true, teacher, action })}
              />
            ))}
          </div>
        )}

        {/* Dialogs */}
        {viewCertificates && selectedTeacher && (
          <TeacherDialog
            teacher={selectedTeacher}
            onClose={() => setViewCertificates(false)}
            onAction={(action) => {
              setViewCertificates(false)
              setActionDialog({ open: true, teacher: selectedTeacher, action })
            }}
          />
        )}

        {actionDialog.open && (
          <ConfirmDialog
            teacher={actionDialog.teacher}
            action={actionDialog.action}
            onCancel={() =>
              setActionDialog({ open: false, teacher: null, action: null })
            }
            onConfirm={() => handleAction(actionDialog.teacher.id, actionDialog.action)}
          />
        )}
      </main>
    </div>
  )
}

export default ManageQuizzes
