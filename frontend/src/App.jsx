import { Route, Routes } from "react-router";
import SignUpForm from "./pages/SignUpForm";  
import LoginForm from "./pages/LoginForm";
import AdminForm from "./pages/AdminForm";
import ManageCourses from "./components/Admin/ManageCourses";
import ManageVerification from "./components/Admin/ManageVerification";
import ManageUsers from "./components/Admin/ManageUsers";
import ManageReports from "./components/Admin/ManageReports";
import Settings from "./components/Admin/Settings";
import TeacherSignUp from "./pages/TeacherSignUp";
import HomePage from "./pages/HomePage";
import TeacherCourseBuilder from "./pages/TeacherCourseBuilder";
import StudentCoursePage from "./pages/StudentCoursePageRefactored";
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import BrowseCoursesPage from './pages/BrowseCoursesPage.jsx';
import TeacherProfilePage from "./pages/TeacherProfilePage.jsx";
import UserNavigates from "./pages/UserNavigates.jsx"
import AnimationStudio from "./pages/AnimationStudio.jsx"
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary.jsx"
import TeacherPage from "./pages/TeacherPage.jsx";
import { AuthProvider } from "./context/AuthContext.jsx"
import { NotificationsProvider } from "./context/NotificationsContext.jsx"

function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationsProvider>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/navigates" element={<UserNavigates />} />

          <Route path="/admin" element={<AdminForm />} />
          <Route path="/admin/courses" element={<ManageCourses />} />
          <Route path="/admin/users" element={<ManageUsers />} />
          <Route path="/admin/verification" element={<ManageVerification />} />
          <Route path="/admin/reports" element={<ManageReports />} />
          <Route path="/admin/Settings" element={<Settings />}/>

          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignUpForm />} />
          
          <Route path="/teacher/signup" element={<TeacherSignUp />} />
          <Route path="/teacher/courseBuilder/:id?" element={<TeacherCourseBuilder />} />
          <Route path="/teacher/studio/:id" element={<AnimationStudio />} />
          <Route path="/teacher/:id" element={<TeacherProfilePage />} />
          <Route path="/instructor/:id" element={<TeacherPage />} />

          <Route path="/student/:id" element={<StudentProfilePage />}/>
          <Route path="/student/coursePage/:courseId?" element={<StudentCoursePage />} />
          
          <Route path="/courses" element={<BrowseCoursesPage />} />
          <Route path="/studio" element={<AnimationStudio />} />
          </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
