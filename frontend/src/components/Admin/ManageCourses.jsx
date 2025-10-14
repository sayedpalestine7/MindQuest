import Sidebar from "./Sidebar"
import CoursesTable from "./course/CoursesTable"
function ManageCourses() {
    return (
    <div className="flex min-h-screen bg-base-200">

      <Sidebar />
      <div className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <CoursesTable/>
      </div>
    </div>
  )
}

export default ManageCourses