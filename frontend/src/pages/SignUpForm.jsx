import React from 'react'
import { motion, AnimatePresence } from "framer-motion"
import { ProfileImageUpload } from '../components/signUp/ProfileImageUpload'
import { NameInput } from '../components/signUp/NameInput.jsx'
import EmailInput from '../components/login/EmailInput.jsx'
import { PasswordInput } from '../components/login/PasswordInput.jsx'
import { SubmitButton } from '../components/login/SubmitButton.jsx'
import { Divider } from '../components/login/Divider.jsx'
import { GoogleSignInButton } from '../components/login/GoogleSignInButton.jsx'
import { useState } from 'react'
import AuthLink from '../components/login/AuthLink.jsx'
import NavigationButtons from '../components/signUp/NavigationButtons.jsx'
import StepIndicator from '../components/signUp/StepIndicator.jsx'
import toast from 'react-hot-toast'
import { tr } from 'motion/react-client'
import axios from "axios";
import { getGoogleIdToken } from "../utils/googleAuth";

function SignUp() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("role", "student"); // or "teacher"
      if (profileImage) formDataToSend.append("profileImage", profileImage);

      const res = await axios.post("http://localhost:5000/api/auth/register", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Sign up successful!");
      console.log(res.data);

      localStorage.setItem("token", res.data.token);
      // Optional: redirect
      // navigate("/login");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Sign up failed");
    } finally {
      setIsLoading(false);
    }
  };

  // handle next step navigation
  const handleNext = () => {
    // Validate step 1 before proceeding
    if (currentStep === 1) {
      if (!formData.name.trim()) {
        toast.error("Please enter your full name");
        return;
      }
      if (!formData.email.trim()) {
        toast.error("Please enter your email");
        return;
      }
      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }
    }

    // Validate step 2 before proceeding to submission
    if (currentStep === 2) {
      if (!formData.password) {
        toast.error("Please enter a password");
        return;
      }
      if (!formData.confirmPassword) {
        toast.error("Please confirm your password");
        return;
      }
      if (formData.password.length < 8) {
        toast.error("Password must be at least 8 characters long");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }
      // Additional password strength validation
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        toast.error("Password must contain both letters and numbers");
        return;
      }
    }

    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
    else {
      // Final submission logic here
      handleSubmit(e);
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }


  // hanle image upload 
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    // Check file size
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
    }
    // Check file type
    if (file && !file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    setProfileImage(file);
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  }

  // Remove selected image
  const removeImage = () => {
    setProfileImage(null);
    setImagePreview(null);
    setError("");
  }

  // Handle input changes for all form fields
  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    setError("");
  }

  // Handle Google Sign Up
  // frontend/src/pages/SignUpForm.jsx
  const handleGoogleSignUp = async () => {
    try {
      setIsLoading(true);
      const googleToken = await getGoogleIdToken();

      const { data } = await axios.post(
        "http://localhost:5000/api/auth/google",
        { token: googleToken, mode: "signup" },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      // Handle successful sign-up
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      toast.success("Account created successfully 🎉");

      // Redirect to dashboard or home page
      navigate('/dashboard');

    } catch (error) {
      console.error('Google Sign-Up error:', error);
      toast.error(error.response?.data?.message || 'Failed to sign up with Google');
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
            <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode='wait'>
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={shake ? "animate-shake" : ""}
                  >
                    <ProfileImageUpload
                      imagePreview={imagePreview}
                      handleImageChange={handleImageChange}
                      removeImage={removeImage}
                      isLoading={isLoading}
                    />
                    <NameInput
                      name={formData.name}
                      setName={(value) => handleInputChange('name', value)}
                      isLoading={isLoading}
                    />

                    <EmailInput
                      email={formData.email}
                      setEmail={(value) => handleInputChange('email', value)}
                      isLoading={isLoading}
                    />
                  </motion.div>
                )} {currentStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className={shake ? "animate-shake" : ""}
                  >
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold">Almost done!</h3>
                      <p className="text-base-content/60">Create a secure password for your account</p>
                    </div>

                    <PasswordInput
                      password={formData.password}
                      setPassword={(value) => handleInputChange('password', value)}
                      isLoading={isLoading}
                      label="Password"
                    />

                    <PasswordInput
                      password={formData.confirmPassword}
                      setPassword={(value) => handleInputChange('confirmPassword', value)}
                      isLoading={isLoading}
                      label="Confirm Password"
                      placeholder="Confirm your password"
                    />
                    {/* <hr className="my-2" />
                    <div className="bg-base-200 rounded-lg p-4">
                      <p className="text-sm text-base-content/70">
                        <strong>Password requirements:</strong>
                        <br />• At least 8 characters long
                        <br />• Use a mix of letters and numbers
                      </p>
                    </div> */}
                  </motion.div>
                )}
              </AnimatePresence>

              <NavigationButtons
                currentStep={currentStep}
                totalSteps={totalSteps}
                onNext={handleNext}
                onBack={handleBack}
                isLoading={isLoading}
                nextDisabled={
                  currentStep === 1
                    ? (!formData.name.trim() || !formData.email.trim())
                    : currentStep === 2
                      ? (!formData.password || !formData.confirmPassword || formData.password.length < 8)
                      : false
                }
              />
              {(currentStep === 2 || currentStep === 1) && (
                <>
                  <Divider />
                  <GoogleSignInButton
                    onClick={handleGoogleSignUp}
                    isLoading={isLoading}
                  >
                    Sign up with Google
                  </GoogleSignInButton>
                  <AuthLink
                    question="Already have an account?"
                    linkText="Login"
                    href="/login"
                    className="mt-4"
                  />
                </>

              )}

            </form>
          </motion.div>

        </div>
      </div>
    </div>


  )
}

export default SignUp