import { apiClient } from '../api/client';

/**
 * Review Service for handling course reviews and ratings
 */

class ReviewService {
  /**
   * Get reviews for a course
   */
  async getCourseReviews(courseId) {
    try {
      const response = await apiClient.get(`/reviews/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching course reviews:', error);
      throw error;
    }
  }

  /**
   * Get student's review for a course
   */
  async getStudentReview(studentId, courseId) {
    try {
      const response = await apiClient.get(`/reviews/student/${studentId}/course/${courseId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No review found
      }
      console.error('Error fetching student review:', error);
      throw error;
    }
  }

  /**
   * Create a review
   */
  async createReview(courseId, rating, comment) {
    try {
      const response = await apiClient.post('/reviews', {
        courseId,
        rating,
        comment
      });
      return response.data;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(reviewId) {
    try {
      const response = await apiClient.delete(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  /**
   * Get featured reviews (for homepage)
   */
  async getFeaturedReviews() {
    try {
      const response = await apiClient.get('/reviews/featured');
      return response.data;
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
      throw error;
    }
  }

  /**
   * Get reviews for a teacher
   */
  async getTeacherReviews(teacherId) {
    try {
      const response = await apiClient.get(`/reviews/teacher/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher reviews:', error);
      throw error;
    }
  }
}

export default new ReviewService();
