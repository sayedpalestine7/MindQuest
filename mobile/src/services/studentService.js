import { apiClient } from '../api/client';

/**
 * Student Service for handling student profile and data
 */

class StudentService {
  /**
   * Get student profile by ID
   */
  async getStudentById(studentId) {
    try {
      const response = await apiClient.get(`/student/id/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student profile:', error);
      throw error;
    }
  }

  /**
   * Update student profile
   */
  async updateStudent(studentId, updateData) {
    try {
      const response = await apiClient.put(`/student/id/${studentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating student profile:', error);
      throw error;
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data; // Returns image URL or data
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }
}

export default new StudentService();
