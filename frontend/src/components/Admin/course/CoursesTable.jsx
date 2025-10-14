import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import SearchBar from "./SearchBar"
import FiltersBar from "./FiltersBar"
import CourseCard from "./CourseCard"
import CourseDialog from "./CourseDialog"
import DeleteDialog from "./DeleteDialog"

export default function CoursesTable() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [teacherFilter, setTeacherFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [selectedCourse, setSelectedCourse] = useState(null)
  const [courseToDelete, setCourseToDelete] = useState(null)

  // 🧪 Use fake data during development
  useEffect(() => {
    const fakeCourses = [
      {
        id: 1,
        title: "React Fundamentals",
        description: "Learn the basics of React, including hooks and components.",
        category: "Web Development",
        teacher: { id: "t1", name: "Alice Johnson" },
        studentsEnrolled: 120,
        createdAt: "2025-09-12",
        status: "published",
      },
      {
        id: 2,
        title: "Advanced Node.js",
        description: "Deep dive into backend development with Node.js and Express.",
        category: "Backend",
        teacher: { id: "t2", name: "Bob Smith" },
        studentsEnrolled: 85,
        createdAt: "2025-08-25",
        status: "draft",
      },
      {
        id: 3,
        title: "Machine Learning 101",
        description: "Introduction to machine learning algorithms and models.",
        category: "Data Science",
        teacher: { id: "t3", name: "Charlie Brown" },
        studentsEnrolled: 190,
        createdAt: "2025-09-30",
        status: "published",
      },
      {
        id: 4,
        title: "UI/UX Design Principles",
        description: "Understand user experience and design interfaces that work.",
        category: "Design",
        teacher: { id: "t1", name: "Alice Johnson" },
        studentsEnrolled: 60,
        createdAt: "2025-07-18",
        status: "draft",
      },
    ]

    // simulate loading delay
    setTimeout(() => {
      setCourses(fakeCourses)
      setLoading(false)
    }, 800)
  }, [])

  // Backend fetch (use later)
  // const fetchCourses = async () => {
  //   try {
  //     const res = await fetch("/api/admin/courses")
  //     const data = await res.json()
  //     setCourses(data.courses)
  //   } catch (err) {
  //     console.error("Failed to fetch courses", err)
  //   } finally {
  //     setLoading(false)
  //   }
  // }

  const toggleStatus = async (id, currentStatus) => {
    setCourses((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: c.status === "published" ? "draft" : "published" } : c
      )
    )
  }

  const deleteCourse = async (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id))
    setCourseToDelete(null)
  }

  const categories = useMemo(() => [...new Set(courses.map((c) => c.category))], [courses])

  const teachers = useMemo(() => {
    const map = new Map()
    courses.forEach((c) => {
      if (!map.has(c.teacher.id)) map.set(c.teacher.id, c.teacher)
    })
    return Array.from(map.values())
  }, [courses])

  const filtered = useMemo(() => {
    return courses
      .filter((c) => {
        const matchSearch =
          c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchStatus = statusFilter === "all" || c.status === statusFilter
        const matchCat = categoryFilter === "all" || c.category === categoryFilter
        const matchTeacher = teacherFilter === "all" || c.teacher.id === teacherFilter
        return matchSearch && matchStatus && matchCat && matchTeacher
      })
      .sort((a, b) => {
        if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt)
        if (sortBy === "students") return b.studentsEnrolled - a.studentsEnrolled
        return a.title.localeCompare(b.title)
      })
  }, [courses, searchQuery, statusFilter, categoryFilter, teacherFilter, sortBy])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loader"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <FiltersBar
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        teacherFilter={teacherFilter}
        setTeacherFilter={setTeacherFilter}
        categories={categories}
        teachers={teachers}
      />

      <p className="text-sm text-gray-500">
        Showing {filtered.length} of {courses.length} courses
      </p>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((course) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
            >
              <CourseCard
                course={course}
                onView={() => setSelectedCourse(course)}
                onToggle={() => toggleStatus(course.id, course.status)}
                onDelete={() => setCourseToDelete(course)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-gray-500 py-12">No courses found.</p>
      )}

      {selectedCourse && (
        <CourseDialog course={selectedCourse} onClose={() => setSelectedCourse(null)} />
      )}

      {courseToDelete && (
        <DeleteDialog
          course={courseToDelete}
          onCancel={() => setCourseToDelete(null)}
          onConfirm={() => deleteCourse(courseToDelete.id)}
        />
      )}
    </div>
  )
}
