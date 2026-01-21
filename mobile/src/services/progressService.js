import { apiClient } from '../api/client';
import storageService from './storageService';

/**
 * Progress Service for handling student progress tracking
 * Includes auto-save with debouncing and offline support
 */

class ProgressService {
  debounceTimers = {};

  /**
   * Get progress for a course
   */
  async getProgress(studentId, courseId) {
    try {
      // Get from local storage first
      const localProgress = await storageService.getProgress(studentId, courseId);

      // Fetch from server
      try {
        const response = await apiClient.get(`/student/${studentId}/progress/${courseId}`);
        const serverProgress = response.data?.data ?? response.data?.progress ?? response.data;

        // Merge server progress with local (server takes precedence)
        if (serverProgress) {
          await storageService.saveProgress(studentId, courseId, {
            ...localProgress,
            ...serverProgress,
            synced: true
          });
          return serverProgress;
        }

        return localProgress || {
          completedLessons: [],
          currentLessonId: null,
          quizScore: 0,
          totalScore: 0,
          status: 'in-progress'
        };
      } catch (error) {
        console.log('Using local progress due to network error');
        return localProgress || {
          completedLessons: [],
          currentLessonId: null,
          quizScore: 0,
          totalScore: 0,
          status: 'in-progress'
        };
      }
    } catch (error) {
      console.error('Error getting progress:', error);
      throw error;
    }
  }

  /**
   * Get all progress for a student
   */
  async getAllProgress(studentId) {
    try {
      const response = await apiClient.get(`/progress/student/${studentId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error getting all progress:', error);
      return [];
    }
  }

  /**
   * Update progress (with debouncing)
   */
  async updateProgress(studentId, courseId, progressData, immediate = false) {
    try {
      // Save to local storage immediately
      await storageService.saveProgress(studentId, courseId, progressData);

      // Clear existing timer for this course
      const timerKey = `${studentId}:${courseId}`;
      if (this.debounceTimers[timerKey]) {
        clearTimeout(this.debounceTimers[timerKey]);
      }

      // Sync with server (debounced or immediate)
      const syncToServer = async () => {
        try {
          const response = await apiClient.put(
            `/student/${studentId}/progress/${courseId}`,
            progressData
          );
          
          // Mark as synced
          await storageService.markProgressSynced(studentId, courseId);
          
          return response.data?.data ?? response.data?.progress ?? response.data;
        } catch (error) {
          console.error('Error syncing progress to server:', error);
          // Progress is still saved locally
        }
      };

      if (immediate) {
        return await syncToServer();
      } else {
        // Debounce: sync after 1 second of inactivity
        this.debounceTimers[timerKey] = setTimeout(syncToServer, 1000);
      }

      return progressData;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  }

  /**
   * Mark lesson as completed
   */
  async markLessonComplete(studentId, courseId, lessonId) {
    try {
      // Update local progress first
      const currentProgress = await this.getProgress(studentId, courseId);
      const completedLessons = currentProgress.completedLessons || [];
      
      if (!completedLessons.includes(lessonId)) {
        completedLessons.push(lessonId);
      }

      const updatedProgress = {
        ...currentProgress,
        completedLessons,
        currentLessonId: lessonId
      };

      // Save locally and sync immediately
      await this.updateProgress(studentId, courseId, updatedProgress, true);

      // Also call the specific endpoint
      try {
        await apiClient.post('/progress/lessonCompleted', {
          studentId,
          courseId,
          lessonId
        });
      } catch (error) {
        console.log('Failed to sync lesson completion, saved locally');
      }

      return updatedProgress;
    } catch (error) {
      console.error('Error marking lesson complete:', error);
      throw error;
    }
  }

  /**
   * Submit quiz score
   */
  async submitQuizScore(studentId, courseId, quizScore, totalScore) {
    try {
      const response = await apiClient.post('/progress/quizCompleted', {
        studentId,
        courseId,
        quizScore,
        totalScore
      });

      // Update local progress
      const currentProgress = await this.getProgress(studentId, courseId);
      await storageService.saveProgress(studentId, courseId, {
        ...currentProgress,
        quizScore,
        totalScore,
        status: 'completed',
        synced: true
      });

      // Remove quiz progress from cache
      await storageService.removeQuizProgress(courseId);

      return response.data;
    } catch (error) {
      console.error('Error submitting quiz score:', error);
      
      // Save locally even if server fails
      const currentProgress = await this.getProgress(studentId, courseId);
      await storageService.saveProgress(studentId, courseId, {
        ...currentProgress,
        quizScore,
        totalScore,
        status: 'completed',
        synced: false
      });
      
      throw error;
    }
  }

  /**
   * Reset progress for a course
   */
  async resetProgress(studentId, courseId) {
    try {
      await apiClient.delete(`/student/${studentId}/progress/${courseId}`);
      
      // Clear local storage
      await storageService.saveProgress(studentId, courseId, {
        completedLessons: [],
        currentLessonId: null,
        quizScore: 0,
        totalScore: 0,
        status: 'in-progress',
        synced: true
      });

      await storageService.removeQuizProgress(courseId);

      return true;
    } catch (error) {
      console.error('Error resetting progress:', error);
      throw error;
    }
  }

  /**
   * Sync all unsynced progress (useful on app startup or network reconnection)
   */
  async syncAllProgress(studentId) {
    try {
      const unsyncedProgress = await storageService.getAllUnsyncedProgress(studentId);
      
      console.log(`Syncing ${unsyncedProgress.length} unsynced progress records`);

      for (const progress of unsyncedProgress) {
        try {
          await apiClient.put(
            `/student/${studentId}/progress/${progress.courseId}`,
            progress
          );
          await storageService.markProgressSynced(studentId, progress.courseId);
          console.log(`Synced progress for course: ${progress.courseId}`);
        } catch (error) {
          console.error(`Failed to sync progress for course: ${progress.courseId}`, error);
        }
      }

      return true;
    } catch (error) {
      console.error('Error syncing all progress:', error);
      return false;
    }
  }
}

export default new ProgressService();
