import { apiClient } from '../api/client';

/**
 * Payment Service for handling Stripe payments
 */

class PaymentService {
  /**
   * Create a payment intent for course enrollment
   */
  async createPaymentIntent(courseId, studentId) {
    try {
      const response = await apiClient.post('/payments/create-intent', {
        courseId,
        studentId
      });
      
      return response.data; // { clientSecret, amount, courseTitle }
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  /**
   * Verify payment status (optional, webhook handles auto-enrollment)
   */
  async verifyPayment(paymentIntentId) {
    try {
      const response = await apiClient.get(`/payments/verify/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }
}

export default new PaymentService();
