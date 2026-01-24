import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { Facebook, Linkedin, Twitter, Github, Globe, Instagram, Youtube, Mail, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import courseService from "../services/courseService";
import DashboardLayout from "../components/profiles/teacher/DashboardLayout";
import LeftPanel from "../components/profiles/teacher/LeftPanel";
import TeacherHeader from "../components/profiles/treacherInfo/TeacherHeader";
import ExpertiseTags from "../components/profiles/treacherInfo/ExpertiseTags";
import CoursesList from "../components/profiles/treacherInfo/CoursesList";
import ReviewsList from "../components/profiles/treacherInfo/ReviewsList";
import Header from "../components/profiles/treacherInfo/Header";

// Helper function to detect link type and return appropriate icon
const getLinkIcon = (url) => {
  const urlLower = url.toLowerCase();
  
  // Email detection
  if (urlLower.startsWith('mailto:') || (urlLower.includes('@') && !urlLower.includes('/'))) {
    return { Icon: Mail, color: 'text-red-600 hover:text-red-700', name: 'Email' };
  }
  
  // Phone detection
  if (urlLower.startsWith('tel:')) {
    return { Icon: Phone, color: 'text-green-600 hover:text-green-700', name: 'Phone' };
  }
  
  // Social media platforms
  if (urlLower.includes('facebook.com') || urlLower.includes('fb.com')) {
    return { Icon: Facebook, color: 'text-blue-600 hover:text-blue-700', name: 'Facebook' };
  }
  if (urlLower.includes('linkedin.com')) {
    return { Icon: Linkedin, color: 'text-blue-700 hover:text-blue-800', name: 'LinkedIn' };
  }
  if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
    return { Icon: Twitter, color: 'text-sky-500 hover:text-sky-600', name: 'Twitter/X' };
  }
  if (urlLower.includes('github.com')) {
    return { Icon: Github, color: 'text-gray-800 hover:text-gray-900', name: 'GitHub' };
  }
  if (urlLower.includes('instagram.com')) {
    return { Icon: Instagram, color: 'text-pink-600 hover:text-pink-700', name: 'Instagram' };
  }
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) {
    return { Icon: Youtube, color: 'text-red-600 hover:text-red-700', name: 'YouTube' };
  }
  
  return { Icon: Globe, color: 'text-gray-600 hover:text-gray-700', name: 'Website' };
};

// Helper to normalize links (add https:// if needed, handle mailto: and tel:)
const normalizeLink = (link) => {
  const trimmed = link.trim();
  
  // Already has protocol
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || 
      trimmed.startsWith('mailto:') || trimmed.startsWith('tel:')) {
    return trimmed;
  }
  
  // Email without mailto:
  if (trimmed.includes('@') && !trimmed.includes('/')) {
    return `mailto:${trimmed}`;
  }
  
  // Phone-like pattern (contains mostly digits, +, -, (), spaces)
  if (/^[\d\s\+\-\(\)]+$/.test(trimmed)) {
    return `tel:${trimmed.replace(/\s/g, '')}`;
  }
  
  // Website - add https://
  return trimmed.startsWith('www.') ? `https://${trimmed}` : `https://${trimmed}`;
};

export default function TeacherPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeTab, setActiveTab] = useState("courses");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Get student ID from auth or localStorage
  useEffect(() => {
    const userId = user?.id || localStorage.getItem("userId");
    if (userId) {
      setStudentId(userId);
    }
  }, [user]);

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await axios.get(`http://localhost:5000/api/teacher/id/${id}`);
        const data = res.data || {};

        // Calculate total students by summing students from all courses
        // Same student in multiple courses is counted multiple times
        const courses = data.courses || [];
        const totalStudents = courses.reduce((sum, course) => sum + (course.students || 0), 0);

        // Normalize course IDs: ensure each course has an 'id' property from '_id'
        const normalizedCourses = courses.map(course => ({
          ...course,
          id: course._id || course.id,
        }));

        const mappedTeacher = {
          ...data,
          // ensure arrays for components
          courses: normalizedCourses,
          expertise: data.expertise || (data.specialization ? [data.specialization] : []),
          totalStudents: totalStudents,
          rating: data.rating || 0,
          avatar: data.profileImage || data.avatar || "/placeholder.svg",
        };

        setTeacher(mappedTeacher);
      } catch (err) {
        console.error("Error fetching teacher:", err);
        setError(err.response?.data?.message || "Failed to load teacher");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTeacher();
  }, [id]);

  // Fetch enrolled courses for the student
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!studentId) return;
      try {
        const result = await courseService.getEnrolledCourses(studentId);
        if (result.success && result.data) {
          const enrolledIds = result.data.map(c => c._id);
          setEnrolledCourses(enrolledIds);
        }
      } catch (err) {
        console.error("Error fetching enrolled courses:", err);
      }
    };
    fetchEnrolledCourses();
  }, [studentId]);

  // Fetch reviews for the teacher
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        setReviewsLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        const res = await axios.get(
          `http://localhost:5000/api/reviews/teacher/${id}`,
          { headers }
        );
        setReviews(res.data || []);
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setReviews([]);
      } finally {
        setReviewsLoading(false);
      }
    };

    fetchReviews();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error || !teacher) return <div className="min-h-screen flex items-center justify-center text-red-500">{error || "Teacher Not Found"}</div>;

  const handleEnroll = async (courseId) => {
    if (!studentId) {
      toast.error("Please log in first");
      return;
    }

    if (enrolledCourses.includes(courseId)) {
      toast.error("You are already enrolled in this course!");
      return;
    }

    const loadingToast = toast.loading("Enrolling...");

    try {
      // Call backend API to enroll student
      const result = await courseService.enrollCourse(studentId, courseId);
      if (result.success) {
        // Update local enrolled courses state
        setEnrolledCourses([...enrolledCourses, courseId]);
        toast.success("Successfully enrolled!", { id: loadingToast });
        // Navigate to the course page with slight delay
        setTimeout(() => {
          navigate(`/student/coursePage/${courseId}`);
        }, 500);
      } else {
        toast.error(result.error || "Failed to enroll in course", { id: loadingToast });
      }
    } catch (err) {
      console.error("Enrollment error:", err);
      toast.error("Error enrolling in course", { id: loadingToast });
    }
  };

  return (
    <>
      <Toaster position="top-right" />
      <DashboardLayout
        header={<Header />}
        leftPanel={
          <LeftPanel
            header={
              <div className="border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-violet-50 p-6">
                <TeacherHeader teacher={teacher} reviewsCount={reviews.length} />
                <div className="mt-6 pt-6 border-t border-slate-200">
                  <ExpertiseTags skills={teacher.expertise} />
                </div>
              </div>
            }
            mainContent={
              <div className="p-6 space-y-6">
                {/* Teacher Profile Summary */}
                <div className="flex items-center gap-6 pb-6 border-b border-slate-200">
                  <div className="flex-shrink-0">
                    <img
                      src={teacher.avatar || "/placeholder.svg"}
                      alt={teacher.name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-100"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold text-slate-800 truncate">{teacher.name}</h2>
                    {teacher.title && (
                      <p className="text-sm text-slate-500 mt-1 truncate">{teacher.title}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg px-4 py-2 w-28">
                      <div className="text-xs text-blue-600 font-medium">Courses</div>
                      <div className="text-lg font-bold text-blue-700">{teacher.courses?.length || 0}</div>
                    </div>

                    <div className="flex flex-col items-center bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg px-4 py-2 w-28">
                      <div className="text-xs text-green-600 font-medium">Students</div>
                      <div className="text-lg font-bold text-green-700">{teacher.totalStudents || 0}</div>
                    </div>

                    <div className="flex flex-col items-center bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg px-4 py-2 w-28">
                      <div className="text-xs text-yellow-600 font-medium">Rating</div>
                      <div className="text-lg font-bold text-yellow-700">{teacher.rating ? teacher.rating.toFixed(1) : 'N/A'}{teacher.rating && <span className="ml-1">⭐</span>}</div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                {teacher.bio && (
                  <div className="bg-white rounded-lg border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800 mb-3">About</h3>
                    <p className="text-slate-600 leading-relaxed">{teacher.bio}</p>
                  </div>
                )}

                {/* Teaching Info */}
                <div className="bg-white rounded-lg border border-slate-200 p-5">
                  <h3 className="text-lg font-semibold text-slate-800 mb-3">Teaching Information</h3>
                  <div className="space-y-2 text-sm">
                    {teacher.email && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium min-w-[100px]">Email:</span>
                        <span className="text-slate-700">{teacher.email}</span>
                      </div>
                    )}
                    {teacher.specialization && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium min-w-[100px]">Specialization:</span>
                        <span className="text-slate-700">{teacher.specialization}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium min-w-[100px]">Reviews:</span>
                      <span className="text-slate-700">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
                    </div>
                    
                    {/* Social Links / Contact Links */}
                    {teacher.link && (() => {
                      const links = String(teacher.link)
                        .split(/[,\s]+/)
                        .map((l) => l.trim())
                        .filter(Boolean);

                      if (links.length === 0) return null;

                      return (
                        <div className="pt-3 mt-3 border-t border-slate-200">
                          <span className="text-slate-500 font-medium block mb-2">Connect:</span>
                          <div className="flex items-center gap-2 flex-wrap">
                            {links.map((link, idx) => {
                              const { Icon, color, name } = getLinkIcon(link);
                              const fullUrl = normalizeLink(link);
                              
                              return (
                                <a
                                  key={`${link}-${idx}`}
                                  href={fullUrl}
                                  target={fullUrl.startsWith('mailto:') || fullUrl.startsWith('tel:') ? '_self' : '_blank'}
                                  rel={fullUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                                  className={`inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 transition-all ${color}`}
                                  title={name}
                                >
                                  <Icon size={18} />
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            }
          />
        }
        rightPanel={
          <div className="flex flex-col h-full min-h-0">
            {/* Tab Navigation */}
            <div className="flex bg-white sticky top-0 z-20" style={{ borderBottom: '2px solid #E0E0E0' }}>
              <button
                onClick={() => setActiveTab("courses")}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  activeTab === "courses" ? "border-b-2" : ""
                }`}
                style={{
                  color: activeTab === "courses" ? "#3F51B5" : "#607D8B",
                  borderBottomColor: activeTab === "courses" ? "#3F51B5" : "transparent",
                  backgroundColor: activeTab === "courses" ? "#F5F7FA" : "transparent"
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Courses
                </span>
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-4 px-6 font-semibold transition-all ${
                  activeTab === "reviews" ? "border-b-2" : ""
                }`}
                style={{
                  color: activeTab === "reviews" ? "#3F51B5" : "#607D8B",
                  borderBottomColor: activeTab === "reviews" ? "#3F51B5" : "transparent",
                  backgroundColor: activeTab === "reviews" ? "#F5F7FA" : "transparent"
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  Reviews
                </span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              <AnimatePresence mode="wait">
                {activeTab === "courses" && (
                  <motion.div
                    key="courses"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4"
                  >
                    <CoursesList
                      courses={teacher.courses}
                      enrolledCourses={enrolledCourses}
                    />
                  </motion.div>
                )}

                {activeTab === "reviews" && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full min-h-0 overflow-y-auto overscroll-contain p-3 sm:p-4"
                  >
                    <ReviewsList reviews={reviews} loading={reviewsLoading} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        }
      />
    </>
  );
}
