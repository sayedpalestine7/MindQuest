import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Platform-aware storage wrapper
 * Uses expo-secure-store for iOS/Android (secure)
 * Uses localStorage for web (compatible)
 */

const isWeb = Platform.OS === 'web';

export const platformStorage = {
  async getItem(key) {
    try {
      if (isWeb) {
        // Use localStorage for web
        return localStorage.getItem(key);
      } else {
        // Use SecureStore for iOS/Android
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key, value) {
    try {
      if (!value) return;
      
      if (isWeb) {
        // Use localStorage for web
        localStorage.setItem(key, value);
      } else {
        // Use SecureStore for iOS/Android
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      throw error;
    }
  },

  async removeItem(key) {
    try {
      if (isWeb) {
        // Use localStorage for web
        localStorage.removeItem(key);
      } else {
        // Use SecureStore for iOS/Android
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      throw error;
    }
  },
};
