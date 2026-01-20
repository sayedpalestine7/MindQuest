import apiClient from '../api/client';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const certificateService = {
  /**
   * Generate and download certificate for completed course
   * @param {string} studentId 
   * @param {string} courseId 
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async generateCertificate(studentId, courseId) {
    try {
      const endpoint = `/api/student/${studentId}/certificate/${courseId}`;
      const fileUri = FileSystem.documentDirectory + `certificate-${courseId}-${Date.now()}.pdf`;

      // Download PDF file
      const downloadResult = await FileSystem.downloadAsync(
        `${apiClient.defaults.baseURL}${endpoint}`,
        fileUri
      );

      if (downloadResult.status === 200) {
        return {
          success: true,
          filePath: downloadResult.uri
        };
      } else {
        throw new Error('Failed to download certificate');
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Share certificate file
   * @param {string} filePath 
   */
  async shareCertificate(filePath) {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      await Sharing.shareAsync(filePath, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share Certificate'
      });

      return { success: true };
    } catch (error) {
      console.error('Error sharing certificate:', error);
      return {
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Check if course is eligible for certificate
   * @param {string} studentId 
   * @param {string} courseId 
   */
  async checkEligibility(studentId, courseId) {
    try {
      // Get progress to check completion
      const response = await apiClient.get(`/api/student/${studentId}/progress/${courseId}`);
      
      if (response.data.success) {
        const progress = response.data.data;
        // Check if all lessons completed and quiz passed
        const eligible = progress.completedLessons?.length > 0 && progress.quizScore > 0;
        
        return {
          success: true,
          eligible,
          progress
        };
      }
      
      return { success: false, eligible: false };
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      return {
        success: false,
        eligible: false,
        error: error.message
      };
    }
  }
};

export default certificateService;
