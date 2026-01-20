import { apiClient } from '../api/client';
import storageService from './storageService';

/**
 * Course Service for handling course-related API calls
 * Includes offline caching support
 */

class CourseService {
  /**
   * Get all courses with filters
   */
  async getCourses(params = {}) {
    try {
      const { page = 1, limit = 10, sortBy, category, difficulty, search } = params;
      
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(sortBy && { sortBy }),
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(search && { search }),
      });

      const response = await apiClient.get(`/courses?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  /**
   * Get categories
   */
  async getCategories() {
    try {
      const response = await apiClient.get('/courses/categories');
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Get course by ID (with offline cache support)
   */
  async getCourseById(courseId, useCache = true) {
    try {
      // Try to get from cache first
      if (useCache) {
        const cached = await storageService.getCachedCourse(courseId);
        if (cached) {
          console.log('Using cached course data');
          return cached;
        }
      }

      // Fetch from server
      const response = await apiClient.get(`/courses/${courseId}`);
      const courseData = response.data;

      // Cache the course data
      await storageService.saveCourse(courseId, courseData);

      return courseData;
    } catch (error) {
      console.error('Error fetching course:', error);
      
      // If offline, try to return cached data even if expired
      const cached = await storageService.getCachedCourse(courseId);
      if (cached) {
        console.log('Using expired cache due to network error');
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Enroll in course
   */
  async enrollInCourse(studentId, courseId) {
    try {
      const response = await apiClient.post(`/student/${studentId}/enroll/${courseId}`);
      
      // Invalidate enrolled courses cache
      await storageService.saveEnrolledCourses(studentId, null);
      
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  }

  /**
   * Get enrolled courses
   */
  async getEnrolledCourses(studentId, useCache = true) {
    try {
      // Try cache first
      if (useCache) {
        const cached = await storageService.getEnrolledCourses(studentId);
        if (cached) {
          console.log('Using cached enrolled courses');
          return cached;
        }
      }

      // Fetch from server
      const response = await apiClient.get(`/student/${studentId}/courses`);
      const courses = response.data.enrolledCourses || response.data;

      // Cache the data
      await storageService.saveEnrolledCourses(studentId, courses);

      return courses;
    } catch (error) {
      console.error('Error fetching enrolled courses:', error);
      
      // Return cached data on error
      const cached = await storageService.getEnrolledCourses(studentId);
      if (cached) {
        return cached;
      }
      
      throw error;
    }
  }

  /**
   * Get quizzes for a course
   */
  async getCourseQuizzes(courseId) {
    try {
      const response = await apiClient.get(`/quizzes/course/${courseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching quizzes:', error);
      throw error;
    }
  }
}

export default new CourseService();
