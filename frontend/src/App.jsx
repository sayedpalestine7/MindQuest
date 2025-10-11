
import { BrowserRouter, Route, Routes } from "react-router";
import SignUpForm from "./pages/SignUpForm";
import LoginForm from "./pages/LoginForm";
import HomePage from "./pages/HomePage";

function App() {

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignUpForm />} />
      </Routes>
    </>
  )
}

export default App
