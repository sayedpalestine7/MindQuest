import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Storage Service for handling local data persistence
 * Supports offline caching and optimistic updates
 */

class StorageService {
  // User and Auth
  async saveUser(user) {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user:', error);
    }
  }

  async getUser() {
    try {
      const user = await AsyncStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async removeUser() {
    try {
      await AsyncStorage.removeItem('user');
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  // Progress Tracking
  async saveProgress(studentId, courseId, progress) {
    try {
      const key = `student-progress:${studentId}:${courseId}`;
      const progressData = {
        ...progress,
        lastUpdated: new Date().toISOString(),
        synced: false
      };
      await AsyncStorage.setItem(key, JSON.stringify(progressData));
      return progressData;
    } catch (error) {
      console.error('Error saving progress:', error);
      return null;
    }
  }

  async getProgress(studentId, courseId) {
    try {
      const key = `student-progress:${studentId}:${courseId}`;
      const progress = await AsyncStorage.getItem(key);
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting progress:', error);
      return null;
    }
  }

  async markProgressSynced(studentId, courseId) {
    try {
      const progress = await this.getProgress(studentId, courseId);
      if (progress) {
        progress.synced = true;
        await this.saveProgress(studentId, courseId, progress);
      }
    } catch (error) {
      console.error('Error marking progress synced:', error);
    }
  }

  async getAllUnsyncedProgress(studentId) {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const progressKeys = keys.filter(key => 
        key.startsWith(`student-progress:${studentId}:`)
      );
      
      const progressData = await AsyncStorage.multiGet(progressKeys);
      return progressData
        .map(([key, value]) => {
          const parsed = JSON.parse(value);
          const courseId = key.split(':')[2];
          return { courseId, ...parsed };
        })
        .filter(p => !p.synced);
    } catch (error) {
      console.error('Error getting unsynced progress:', error);
      return [];
    }
  }

  // Quiz Progress
  async saveQuizProgress(courseId, quizProgress) {
    try {
      const key = `quiz-progress:${courseId}`;
      await AsyncStorage.setItem(key, JSON.stringify(quizProgress));
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  }

  async getQuizProgress(courseId) {
    try {
      const key = `quiz-progress:${courseId}`;
      const progress = await AsyncStorage.getItem(key);
      return progress ? JSON.parse(progress) : null;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return null;
    }
  }

  async removeQuizProgress(courseId) {
    try {
      const key = `quiz-progress:${courseId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing quiz progress:', error);
    }
  }

  // Course Cache (for offline access)
  async saveCourse(courseId, courseData) {
    try {
      const key = `course-cache:${courseId}`;
      const cacheData = {
        ...courseData,
        cachedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching course:', error);
    }
  }

  async getCachedCourse(courseId) {
    try {
      const key = `course-cache:${courseId}`;
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      // Check if cache is older than 24 hours
      const cacheAge = Date.now() - new Date(data.cachedAt).getTime();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      if (cacheAge > maxAge) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error getting cached course:', error);
      return null;
    }
  }

  async removeCachedCourse(courseId) {
    try {
      const key = `course-cache:${courseId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing cached course:', error);
    }
  }

  // Enrolled Courses Cache
  async saveEnrolledCourses(studentId, courses) {
    try {
      const key = `enrolled-courses:${studentId}`;
      const cacheData = {
        courses,
        cachedAt: new Date().toISOString()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error caching enrolled courses:', error);
    }
  }

  async getEnrolledCourses(studentId) {
    try {
      const key = `enrolled-courses:${studentId}`;
      const cached = await AsyncStorage.getItem(key);
      if (!cached) return null;

      const data = JSON.parse(cached);
      // Cache for 1 hour
      const cacheAge = Date.now() - new Date(data.cachedAt).getTime();
      const maxAge = 60 * 60 * 1000; // 1 hour

      if (cacheAge > maxAge) {
        return null;
      }

      // Ensure it's an array
      const courses = data.courses;
      return Array.isArray(courses) ? courses : null;
    } catch (error) {
      console.error('Error getting enrolled courses:', error);
      return null;
    }
  }

  async clearEnrolledCourses(studentId) {
    try {
      const key = `enrolled-courses:${studentId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error clearing enrolled courses:', error);
    }
  }

  // Chat Messages Cache
  async saveChatMessages(teacherId, studentId, messages) {
    try {
      const key = `chat-messages:${teacherId}:${studentId}`;
      await AsyncStorage.setItem(key, JSON.stringify(messages));
    } catch (error) {
      console.error('Error caching chat messages:', error);
    }
  }

  async getChatMessages(teacherId, studentId) {
    try {
      const key = `chat-messages:${teacherId}:${studentId}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting chat messages:', error);
      return [];
    }
  }

  // Quiz Progress
  async saveQuizProgress(courseId, progressData) {
    try {
      const key = `quiz-progress:${courseId}`;
      await AsyncStorage.setItem(key, JSON.stringify(progressData));
    } catch (error) {
      console.error('Error saving quiz progress:', error);
    }
  }

  async getQuizProgress(courseId) {
    try {
      const key = `quiz-progress:${courseId}`;
      const cached = await AsyncStorage.getItem(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Error getting quiz progress:', error);
      return null;
    }
  }

  async removeQuizProgress(courseId) {
    try {
      const key = `quiz-progress:${courseId}`;
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing quiz progress:', error);
    }
  }

  // Notification Token
  async saveNotificationToken(token) {
    try {
      await AsyncStorage.setItem('notification-token', token);
    } catch (error) {
      console.error('Error saving notification token:', error);
    }
  }

  async getNotificationToken() {
    try {
      return await AsyncStorage.getItem('notification-token');
    } catch (error) {
      console.error('Error getting notification token:', error);
      return null;
    }
  }

  // Clear all data (logout)
  async clearAll() {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  // Get all keys (for debugging)
  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting keys:', error);
      return [];
    }
  }
}

export default new StorageService();
