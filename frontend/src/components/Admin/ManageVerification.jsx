import React, { useEffect, useState } from "react"
import { motion } from "framer-motion"
import TeacherCard from "./teacher/TeacherCard.jsx"
import TeacherStats from "./teacher/TeacherStats.jsx"
import TeacherDialog from "./teacher/TeacherDialog.jsx"
import ConfirmDialog from "./teacher/ConfirmDialog.jsx"
import Sidebar from './Sidebar.jsx'
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"
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
  setLoading(true);
  try {
    const res = await fetch("http://localhost:5000/api/admin/pending-teachers", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    const data = await res.json();

    setTeachers(data);
    setFilteredTeachers(data);

  } catch (err) {
    toast.error("Failed to load pending teachers");
  } finally {
    setLoading(false);
  }
};


const handleAction = async (teacherId, action, reason) => {
  try {
    let url = "";
    if (action === "approve") {
      url = `http://localhost:5000/api/admin/approve-teacher/${teacherId}`;
    }
    if (action === "reject") {
      url = `http://localhost:5000/api/admin/reject-teacher/${teacherId}`;
    }

    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: action === "reject" ? JSON.stringify({ reason }) : undefined,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message || "Action failed");

    toast.success(`Teacher ${action}d successfully`);

    // Remove the approved teacher from UI
    setTeachers(teachers.filter((t) => t.id !== teacherId));

  } catch (err) {
    toast.error(err.message);
  } finally {
    setActionDialog({ open: false, teacher: null, action: null });
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Sidebar />

        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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
            className="w-full border border-gray-700 rounded px-4 py-2 pl-9 bg-gray-900 text-white"
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
          <div className="text-center text-gray-500 py-12">
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
            onConfirm={(reason) => handleAction(actionDialog.teacher.id, actionDialog.action, reason)}
          />
        )}
        </main>
      </div>
    </div>
  )
}

export default ManageQuizzes
