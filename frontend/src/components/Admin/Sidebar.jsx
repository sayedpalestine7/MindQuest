import { Link, useLocation } from "react-router"
import { LayoutDashboard, BookOpen, Users, FileQuestion, Settings } from "lucide-react"

const navigation = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Manage Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Manage Users", href: "/admin/users", icon: Users },
  { name: "Manage Quizzes", href: "/admin/quizzes", icon: FileQuestion },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

function Sidebar() {
  const location = useLocation()

  return (
    <aside className="h-screen w-64 bg-gray-900 text-gray-100 border-r border-gray-800 flex flex-col">
      <div className="flex items-center justify-center h-16 border-b border-gray-800 text-xl font-bold">
        Admin Panel
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              to={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200
                ${isActive
                  ? "bg-gray-800 text-white shadow-md"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white hover:translate-x-1"}
              `}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="truncate">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 text-center text-xs text-gray-500">
        © 2025 LearnX
      </div>
    </aside>
  )
}

export default Sidebar
