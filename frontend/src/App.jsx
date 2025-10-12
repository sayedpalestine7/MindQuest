
import { Route, Routes } from "react-router";
import SignUpForm from "./pages/SignUpForm";  
import LoginForm from "./pages/LoginForm";
import AdminForm from "./pages/AdminForm";
import ManageCourses from "./components/Admin/ManageCourses";
import ManageQuizzes from "./components/Admin/ManageQuizzes";
import ManageUsers from "./components/Admin/ManageUsers";
import Settings from "./components/Admin/Settings";
import TeacherSignUp from "./pages/TeacherSignUp";
function App() {

  return (
    <>
    <Routes>
      <Route path="/admin" element={<AdminForm />} />
      <Route path="/admin/courses" element={<ManageCourses />} />
      <Route path="/admin/users" element={<ManageUsers />} />
      <Route path="/admin/quizzes" element={<ManageQuizzes />} />
      <Route path="/admin/Settings" element={<Settings />}/>
      

      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/teacher/signup" element={<TeacherSignUp />} />
    </Routes>
    </>
  )
}

export default App
