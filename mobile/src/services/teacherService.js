import { apiClient } from '../api/client';

/**
 * Teacher Service for handling teacher profile and data
 */
class TeacherService {
  /**
   * Get teacher profile by teacher _id
   */
  async getTeacherById(teacherId) {
    try {
      const response = await apiClient.get(`/teacher/id/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      throw error;
    }
  }

  /**
   * Get teacher profile by userId
   */
  async getTeacherByUserId(userId) {
    try {
      const response = await apiClient.get(`/teacher/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher profile by user:', error);
      throw error;
    }
  }

  /**
   * Update teacher profile by teacher _id
   */
  async updateTeacher(teacherId, updateData) {
    try {
      const response = await apiClient.put(`/teacher/id/${teacherId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating teacher profile:', error);
      throw error;
    }
  }
}

export default new TeacherService();
