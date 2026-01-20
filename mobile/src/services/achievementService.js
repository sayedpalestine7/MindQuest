import apiClient from '../api/client';
import storageService from './storageService';

const CACHE_KEY = 'achievements';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const achievementService = {
  /**
   * Get student achievements
   * @param {string} studentId 
   * @param {boolean} forceRefresh - Skip cache
   */
  async getAchievements(studentId, forceRefresh = false) {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cached = await storageService.get(`${CACHE_KEY}_${studentId}`);
        if (cached) {
          return {
            success: true,
            data: cached,
            fromCache: true
          };
        }
      }

      // Fetch from API
      const response = await apiClient.get(`/api/student/${studentId}/achievements`);
      
      if (response.data.success) {
        // Cache the result
        await storageService.set(
          `${CACHE_KEY}_${studentId}`, 
          response.data.data,
          CACHE_TTL
        );

        return {
          success: true,
          data: response.data.data,
          fromCache: false
        };
      }

      throw new Error('Failed to fetch achievements');
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Get recent activity for student
   * @param {string} studentId 
   * @param {number} limit 
   */
  async getRecentActivity(studentId, limit = 20) {
    try {
      const response = await apiClient.get(`/api/student/${studentId}/activity`, {
        params: { limit }
      });
      
      if (response.data.success) {
        return {
          success: true,
          data: response.data.data.activities
        };
      }

      throw new Error('Failed to fetch recent activity');
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
  },

  /**
   * Clear achievements cache
   * @param {string} studentId 
   */
  async clearCache(studentId) {
    try {
      await storageService.remove(`${CACHE_KEY}_${studentId}`);
      return { success: true };
    } catch (error) {
      console.error('Error clearing achievements cache:', error);
      return { success: false, error: error.message };
    }
  }
};

export default achievementService;
