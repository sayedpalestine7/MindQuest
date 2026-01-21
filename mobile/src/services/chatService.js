import { apiClient } from '../api/client';
import storageService from './storageService';

/**
 * Chat Service for handling real-time messaging
 */

class ChatService {
  /**
   * Send a message
   */
  async sendMessage(teacherId, studentId, content, sender = 'student') {
    try {
      const response = await apiClient.post('/chat/send', {
        teacher: teacherId,
        student: studentId,
        content,
        sender
      });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get conversation with pagination
   */
  async getConversation(teacherId, studentId, limit = 50, before = null) {
    try {
      let url = `/chat/conversation/${teacherId}/${studentId}?limit=${limit}`;
      if (before) {
        url += `&before=${before}`;
      }

      const response = await apiClient.get(url);
      
      // Cache messages locally
      if (response.data.messages) {
        await storageService.saveChatMessages(teacherId, studentId, response.data.messages);
      }

      return response.data; // { messages, hasMore, oldestCursor }
    } catch (error) {
      console.error('Error fetching conversation:', error);
      
      // Return cached messages on error
      const cached = await storageService.getChatMessages(teacherId, studentId);
      return { messages: cached, hasMore: false, oldestCursor: null };
    }
  }

  /**
   * Get all teacher chats for a student
   */
  async getTeacherChats(studentId) {
    try {
      const response = await apiClient.get(`/chat/student/${studentId}/chats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher chats:', error);
      throw error;
    }
  }

  /**
   * Get all student chats for a teacher
   */
  async getStudentChats(teacherId) {
    try {
      const response = await apiClient.get(`/chat/teacher/${teacherId}/chats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching student chats:', error);
      throw error;
    }
  }

  /**
   * Get students enrolled in teacher courses (chat sidebar)
   */
  async getTeacherEnrolledStudents() {
    try {
      const response = await apiClient.get('/chat/teacher/students');
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher enrolled students:', error);
      throw error;
    }
  }

  /**
   * Get unread message counts
   */
  async getUnreadCounts(studentId) {
    try {
      const response = await apiClient.get(`/chat/student/unread/${studentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching unread counts:', error);
      return {};
    }
  }

  /**
   * Get unread message counts for teacher
   */
  async getTeacherUnreadCounts(teacherId) {
    try {
      const response = await apiClient.get(`/chat/teacher/unread/${teacherId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching teacher unread counts:', error);
      return {};
    }
  }

  /**
   * Mark messages as read
   */
  async markAsRead(teacherId, studentId, reader = 'student') {
    try {
      const response = await apiClient.put(`/chat/read/${teacherId}/${studentId}`, {
        reader,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      throw error;
    }
  }
}

export default new ChatService();
