import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};

// IMPORTANT: Use your machine's LAN IP, not localhost.
// Example: http://192.168.1.50:5000
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  extra.apiUrl ||
  'http://192.168.68.52:5000';

export const GOOGLE_OAUTH = {
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID || extra.googleExpoClientId || '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || extra.googleAndroidClientId || '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || extra.googleIosClientId || '',
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || extra.googleWebClientId || '',
};
