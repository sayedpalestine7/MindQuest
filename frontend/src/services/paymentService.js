import axios from "axios";

const API_BASE = "http://localhost:5000/api";

// Create axios instance for payment API
const paymentClient = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
paymentClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Payment Service for Stripe integration
 */
export const paymentService = {
  /**
   * Create a Stripe PaymentIntent for course enrollment
   * @param {string} courseId - Course ID to enroll in
   * @param {string} studentId - Student ID enrolling
   * @returns {Promise<{success: boolean, clientSecret?: string, amount?: number, error?: string}>}
   */
  createPaymentIntent: async (courseId, studentId) => {
    try {
      const response = await paymentClient.post("/payments/create-intent", {
        courseId,
        studentId,
      });
      
      return {
        success: true,
        clientSecret: response.data.clientSecret,
        amount: response.data.amount,
        courseTitle: response.data.courseTitle,
      };
    } catch (error) {
      console.error("❌ Error creating payment intent:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message || "Failed to create payment intent",
      };
    }
  },
};

export default paymentService;
