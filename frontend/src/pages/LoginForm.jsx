import React, { useContext, useEffect, useState } from 'react'
import { motion } from "framer-motion"
import { GoogleSignInButton } from '../components/login/GoogleSignInButton.jsx'
import EmailInput from '../components/login/EmailInput.jsx'
import { PasswordInput } from '../components/login/PasswordInput.jsx'
import { RememberMe } from '../components/login/RememberMe.jsx'
import { Divider } from '../components/login/Divider.jsx'
import { SubmitButton } from '../components/login/SubmitButton.jsx'
import AuthLink from '../components/login/AuthLink.jsx'
import WelcomeMsg from '../components/login/WelcomeMsg.jsx'
import toast from 'react-hot-toast'
import axios from "axios";
import { useNavigate } from 'react-router'
import { getGoogleIdToken } from "../utils/googleAuth";
import AuthContext from "../context/AuthContext";


function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const rememberEmail = localStorage.getItem("rememberEmail");
    if (rememberEmail) {
      setEmail(rememberEmail)
      setRememberMe(true)
    }
  }, []);

  // 🧩 Mock login function (to be replaced with backend call later)
  const mockLogin = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === "test@example.com" && password === "123456") {
          resolve({ token: "mock-jwt-token", user: { name: "Test User" } });
        } else {
          reject("Invalid email or password");
        }
      }, 1000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setShake(false);

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      const { data } = await axios.post("http://localhost:5000/api/auth/login", {
        email,
        password,
      });

      // ✅ Handle Remember Me
      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      // Store token and user info
      login(data.user, data.token);
      localStorage.setItem("userId", data.user._id);

      toast.success(`Welcome back, ${data.user.name}!`);

      // Redirect after login
      if (data.user.role === "teacher") {
        navigate(`/teacher/${data.user._id}`);
      } else if (data.user.role === "student") {
        navigate(`/student/${data.user._id}`);
      } else {
        navigate("/"); // fallback
      }

    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || "Invalid email or password";
      toast.error(msg);
      setError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsLoading(false);
    }
  };


const handleGoogleSignIn = async () => {
  try {
    setIsLoading(true);

    // 1️⃣ Get Google ID token
    const googleToken = await getGoogleIdToken();

    // 2️⃣ Send to backend
    const { data } = await axios.post(
      "http://localhost:5000/api/auth/google",
      {
        token: googleToken,
        mode: "signin",
      }
    );

    // 3️⃣ Store auth
    login(data.user, data.token);
    localStorage.setItem("userId", data.user._id);

    toast.success(`Welcome back, ${data.user.name}!`);

    // 4️⃣ Redirect
    if (data.user.role === "teacher") {
      navigate(`/teacher/${data.user._id}`);
    } else {
      navigate(`/student/${data.user._id}`);
    }

  } catch (err) {
    console.error(err);
    const msg =
      err.response?.data?.message ||
      err.message ||
      "Google sign in failed";
    toast.error(msg);
  } finally {
    setIsLoading(false);
  }
};



  return (
    <div className="flex items-center justify-center min-h-screen">

      <div className="mq-card max-w-md w-full">

        <div className="card-body">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={shake ? "animate-shake" : ""}
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              <EmailInput email={email} setEmail={setEmail} isLoading={isLoading} />
              <PasswordInput password={password} setPassword={setPassword} isLoading={isLoading} />
              <RememberMe rememberMe={rememberMe} setRememberMe={setRememberMe} isLoading={isLoading} />
              <SubmitButton isLoading={isLoading} >Sign in</SubmitButton>
              <Divider />
              <GoogleSignInButton onClick={handleGoogleSignIn} isLoading={isLoading} />
              <AuthLink
                question="Don't have an account?"
                linkText="Sign up"
                href="/navigates"
                className="mt-4"
              />
            </form>
          </motion.div>
        </div>
      </div>

    </div>

  )
}

export default LoginForm