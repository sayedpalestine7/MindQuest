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
      return { success: true, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message,
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
      return { success: true, url: response.data.url };
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
};

export default courseService;
