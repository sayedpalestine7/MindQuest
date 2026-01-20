import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Course API calls
export const courseService = {
  // Create a new course
  createCourse: async (courseData, teacherId) => {
    try {
      const response = await apiClient.post("/courses", {
        ...courseData,
        teacherId,
      });
      return { success: true, data: response.data.course, id: response.data.course._id };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Update existing course
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await apiClient.put(`/courses/${courseId}`, courseData);
      return { success: true, data: response.data.course };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Get single course by ID
  getCourseById: async (courseId) => {
    try {
      const response = await apiClient.get(`/courses/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Get all courses
  getAllCourses: async () => {
    try {
      const response = await apiClient.get("/courses");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Delete course
  deleteCourse: async (courseId) => {
    try {
      const response = await apiClient.delete(`/courses/${courseId}`);
      return {
        success: true,
        message: response.data.message,
        action: response.data.action, // "deleted", "archived", or "blocked"
        course: response.data.course, // Updated course object if archived
        enrollmentCount: response.data.enrollmentCount
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        action: error.response?.data?.action,
        enrollmentCount: error.response?.data?.enrollmentCount
      };
    }
  },

  // Upload image/file
  uploadFile: async (file, fieldName = "file") => {
    try {
      const formData = new FormData();
      formData.append(fieldName, file);

      const response = await axios.post(`${API_BASE}/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      console.log("Upload response:", response.data);
      
      if (response.data.success) {
        console.log("Image uploaded successfully. URL:", response.data.url);
        return { success: true, url: response.data.url };
      } else {
        return {
          success: false,
          error: response.data.message || "Upload failed",
        };
      }
    } catch (error) {
      console.error("Upload error:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Upload failed",
      };
    }
  },

  // Generate quiz via backend (or n8n) using AI
  generateQuiz: async (courseId, payload) => {
    try {
      const url = courseId ? `/courses/${courseId}/generate-quiz` : `/courses/generate-quiz`;
      const response = await apiClient.post(url, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Import generated questions and optionally create/append a quiz
  importQuestions: async (courseId, payload) => {
    try {
      const url = `/courses/${courseId}/import-questions`;
      const response = await apiClient.post(url, payload);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Enroll student in a course
  enrollCourse: async (studentId, courseId) => {
    try {
      const response = await apiClient.post(`/student/${studentId}/enroll/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  
  // Get enrolled courses for a student
  getEnrolledCourses: async (studentId) => {
    try {
      const response = await apiClient.get(`/student/${studentId}/courses`);
      return { success: true, data: response.data.enrolledCourses };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Get quizzes for a course
  getQuizzesByCourse: async (courseId) => {
    try {
      const response = await apiClient.get(`/quizzes/course/${courseId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Update student progress in a course
  updateStudentProgress: async (studentId, courseId, progressData) => {
    try {
      const response = await apiClient.put(`/student/${studentId}/progress/${courseId}`, progressData);
      // Backend already returns { success: true, data: ... }, so return it directly
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Get student progress in a course
  getStudentProgress: async (studentId, courseId) => {
    try {
      const response = await apiClient.get(`/student/${studentId}/progress/${courseId}`);
      // Backend already returns { success: true, data: ... }, so return it directly
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Reset student progress in a course
  resetStudentProgress: async (studentId, courseId, firstLessonId) => {
    try {
      const response = await apiClient.delete(`/student/${studentId}/progress/${courseId}`, {
        data: { firstLessonId }
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },
  // Mark quiz completed (updates progress.quizScore, totalScore and status if passed)
  markQuizCompleted: async (studentId, courseId, quizScore, totalScore) => {
    try {
      const response = await apiClient.post(`/progress/quizCompleted`, {
        studentId,
        courseId,
        quizScore,
        totalScore,
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  },
};

export default courseService;