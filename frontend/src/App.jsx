
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
      

      <Route path="/login" element={<LoginForm />} />
      <Route path="/signup" element={<SignUpForm />} />
      <Route path="/teacher/signup" element={<TeacherSignUp />} />
    </Routes>
    </>
  )
}

export default App
