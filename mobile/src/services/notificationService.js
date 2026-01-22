import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import storageService from './storageService';
import { apiClient, tokenStorage } from '../api/client';

/**
 * Notification Service for handling push notifications
 */

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  notificationListener = null;
  responseListener = null;

  /**
   * Register for push notifications
   */
  async registerForPushNotifications() {
    try {
      // Get projectId from app config
      const projectId = Constants.expoConfig?.extra?.expoProjectId;
      
      // Skip push notification setup if no projectId is configured
      if (!projectId) {
        console.log('Push notifications disabled: No Expo projectId configured in app.json');
        return null;
      }

      if (!Device.isDevice) {
        console.log('Must use physical device for Push Notifications');
        return null;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({ projectId });
      
      // Save token to storage
      await storageService.saveNotificationToken(token.data);
      
      console.log('Push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return null;
    }
  }

  /**
   * Set up notification listeners
   */
  setupNotificationListeners(onNotificationReceived, onNotificationResponse) {
    // Listener for notifications received while app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    });

    // Listener for user tapping on notification
    this.responseListener = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('Notification response:', response);
      if (onNotificationResponse) {
        onNotificationResponse(response);
      }
    });
  }

  /**
   * Remove notification listeners
   */
  removeNotificationListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Schedule a local notification
   */
  async scheduleLocalNotification(title, body, data = {}, seconds = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: seconds > 0 ? { seconds } : null,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Get badge count
   */
  async getBadgeCount() {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Error getting badge count:', error);
      return 0;
    }
  }

  /**
   * Set badge count
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Error setting badge count:', error);
    }
  }

  /**
   * Clear badge
   */
  async clearBadge() {
    try {
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.error('Error clearing badge:', error);
    }
  }

  /**
   * Send push token to backend
   */
  async sendTokenToBackend(token, userId) {
    try {
      // You'll need to create this endpoint in your backend
      await apiClient.post('/api/notifications/register', {
        userId,
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('Error sending token to backend:', error);
    }
  }

  /**
   * Get notifications from API
   */
  async getNotifications({ limit, skip, log } = {}) {
    try {
      const token = await tokenStorage.get();
      const params = {};
      if (Number.isFinite(limit)) params.limit = limit;
      if (Number.isFinite(skip)) params.skip = skip;
      if (log) {
        console.log('Fetching notifications', { limit, skip, hasToken: !!token });
      }
      const response = await apiClient.get('/notifications', {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (log) {
        console.log('Notifications response:', response?.data);
      }
      const payload = response.data;
      const raw = Array.isArray(payload)
        ? payload
        : payload?.notifications || payload?.data?.notifications || payload?.data || [];
      const normalized = raw.map((notification) => ({
        ...notification,
        read: notification.read ?? notification.isRead ?? false,
      }));
      if (log) {
        console.log('Notifications normalized count:', normalized.length);
      }
      return {
        success: true,
        data: normalized
      };
    } catch (error) {
      if (log) {
        console.log('Notifications error status:', error?.response?.status);
      }
      console.error('Error fetching notifications:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId) {
    try {
      await apiClient.put(`/notifications/${notificationId}/read`);
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead() {
    try {
      await apiClient.put('/notifications/read-all');
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId) {
    try {
      await apiClient.delete(`/notifications/${notificationId}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Show local notification
   */
  async showLocalNotification(title, body, data = {}) {
    try {
      await this.scheduleLocalNotification(title, body, data, 0);
    } catch (error) {
      console.error('Error showing local notification:', error);
    }
  }
}

export default new NotificationService();
