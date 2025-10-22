
import { Route, Routes } from "react-router";
import SignUpForm from "./pages/SignUpForm";  
import LoginForm from "./pages/LoginForm";
import AdminForm from "./pages/AdminForm";
import ManageCourses from "./components/Admin/ManageCourses";
import ManageVerification from "./components/Admin/ManageVerification";
import ManageUsers from "./components/Admin/ManageUsers";
import Settings from "./components/Admin/Settings";
import TeacherSignUp from "./pages/TeacherSignUp";
import HomePage from "./pages/HomePage";
import TeacherCourseBuilder from "./pages/TeacherCourseBuilder";
import StudentCoursePage from "./pages/StudentCoursePage";
import StudentProfilePage from './pages/StudentProfilePage.jsx'
import BrowseCoursesPage from './pages/BrowseCoursesPage.jsx'
import TeacherProfilePage from "./pages/TeacherProfilePage.jsx";
import AnimationStudioPage from "./pages/AnimationStudioPage.jsx";


function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminForm />} />
      <Route path="/admin/courses" element={<ManageCourses />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/verification" element={<ManageVerification />} />
      <Route path="/admin/Settings" element={<Settings />}/>
       
      <Route path="/student" element={<StudentProfilePage />}/>
      <Route path="/courses" element={<BrowseCoursesPage />} />
      <Route path="/teacher" element={<TeacherProfilePage />} />


      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/teacher/signup" element={<TeacherSignUp />} />

  
      <Route path="/teacher/courseBuilder" element={<TeacherCourseBuilder />} />
      <Route path="/student/coursePage" element={<StudentCoursePage />} />

      <Route path="/teacher/studio" element={<AnimationStudioPage />} />
      <Route path="/teacher/studio/:id" element={<AnimationStudioPage />} />

    </Routes>
    </>
  )
}

export default App
