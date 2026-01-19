import React from 'react'
import { motion } from "framer-motion"
import { GraduationCap } from "lucide-react"
import { NameInput } from '../components/signUp/NameInput.jsx'
import { useState } from 'react'
import EmailInput from '../components/login/EmailInput.jsx'
import { PasswordInput } from '../components/login/PasswordInput.jsx'
import { SubmitButton } from '../components/login/SubmitButton.jsx'
import toast from 'react-hot-toast'
import Institution from '../components/signUp/Institution.jsx'
import SpecializationSelect from "../components/signUp/SpecializationSelect.jsx"
import AuthLink from '../components/login/AuthLink.jsx'
import CertificationUpload from "../components/signUp/CertificationUpload"
import { ProfileImageUpload } from '../components/signUp/ProfileImageUpload'
import axios from "axios";

function TeacherSignUp() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        institution: "",
        specialization: "",      
        customSpecialization: "",
    })
    const [isLoading, setIsLoading] = useState(false);
    const [certificationFile, setCertificationFile] = useState(null);
    const [uploadingCert, setUploadingCert] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    const specializations = [
        "Software Engineering",
        "Data Structures",
        "Algorithms",
        "Web Development",
        "Mobile Development",
        "Machine Learning",
        "Artificial Intelligence",
        "Database Systems",
        "Computer Networks",
        "Cybersecurity",
        "Cloud Computing",
        "DevOps",
    ]
    const handleSubmit = async (e) => {
  e.preventDefault();
  setIsLoading(true);

  if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
    toast.error("Please fill in all fields");
    setIsLoading(false);
    return;
  }
  if (formData.password !== formData.confirmPassword) {
    toast.error("Passwords do not match.");
    setIsLoading(false);
    return;
  }
  if (!formData.specialization) {
    toast.error("Please select a specialization");
    setIsLoading(false);
    return;
  }
  if (!certificationFile) {
    toast.error("Please upload your teaching certification.");
    setIsLoading(false);
    return;
  }

  try {
    const formDataToSend = new FormData();
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", "teacher");
    formDataToSend.append("institution", formData.institution);
    formDataToSend.append("specialization", formData.specialization);
    if (profileImage?.file) formDataToSend.append("profileImage", profileImage.file);
    if (certificationFile) formDataToSend.append("certification", certificationFile);

    const res = await axios.post("http://localhost:5000/api/auth/register-teacher", formDataToSend, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    toast.success("Teacher account created successfully!");
    console.log(res.data);
  } catch (err) {
    console.error(err);
    toast.error(err.response?.data?.message || "Error signing up");
  } finally {
    setIsLoading(false);
  }
};


    // Handle input changes for all form fields
    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });
    }
    const handleFileUpload = (file, setFile, setUploading) => {
        setUploading(true)
        setTimeout(() => {
            setFile(file) // just set the file for now, no real upload
            setUploading(false)
            toast.success("File uploaded successfully!")
        }, 1000)
    }
    const handleRemoveFile = (setFile) => {
        setFile(null);
        toast("File removed");
    }

    // Profile image handlers
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            toast.error("Please upload an image file");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setProfileImage({
                file: file,
                preview: e.target.result
            });
            toast.success("Profile image added!");
        };
        reader.readAsDataURL(file);
    }

    const removeImage = () => {
        setProfileImage(null);
        toast("Profile image removed");
    }
    return (
        <div className="flex items-center justify-center min-h-screen ">
            <div className="mq-card max-w-2xl w-full">
                <div className="card-body">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}

                    >
                        {/* Logo and Header */}
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
                                <GraduationCap className="w-8 h-8 text-indigo-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Learnful Instructor Portal</h1>
                            <p className="text-gray-600 text-sm">
                                Join as an Instructor and start publishing your interactive courses.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Profile Image Upload */}
                            <ProfileImageUpload
                                imagePreview={profileImage?.preview}
                                handleImageChange={handleImageChange}
                                removeImage={removeImage}
                                isLoading={isLoading}
                            />

                            {/* Name + Email */}
                            <div className='flex flex-col md:flex-row justify-center gap-6'>
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
                            </div>

                            {/* Password + Confirm Password */}
                            <div className='flex flex-col md:flex-row justify-center gap-6'>
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
                            </div>

                            {/* Optional fields */}
                            <Institution formData={formData} setFormData={setFormData} />

                            <SpecializationSelect
                                formData={formData}
                                setFormData={setFormData}
                                specializations={specializations}
                            />
                            <CertificationUpload
                                file={certificationFile}
                                setFile={setCertificationFile}
                                uploading={uploadingCert}
                                setUploading={setUploadingCert}
                                handleFileUpload={handleFileUpload}
                                handleRemoveFile={handleRemoveFile}
                            />
                            {/* Submit Button */}
                            <SubmitButton isLoading={isLoading} >Sign UP</SubmitButton>
                            <AuthLink
                                question="Already have an account?"
                                linkText="Login"
                                href="/login"
                                className="mt-4"
                            />
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default TeacherSignUp