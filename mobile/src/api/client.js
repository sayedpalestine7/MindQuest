import axios from 'axios';
import { platformStorage } from '../auth/storage';
import { API_URL } from '../constants';

const TOKEN_KEY = 'mindquest_token';
const USER_KEY = 'mindquest_user';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await platformStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle 401 errors (expired/invalid tokens)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token and user data
      await tokenStorage.clear();
      await platformStorage.removeItem(USER_KEY);
      
      // Optionally reload the app to redirect to login
      // Note: This will be caught by auth context
      console.warn('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export const tokenStorage = {
  async get() {
    return platformStorage.getItem(TOKEN_KEY);
  },
  async set(token) {
    if (!token) return;
    return platformStorage.setItem(TOKEN_KEY, token);
  },
  async clear() {
    return platformStorage.removeItem(TOKEN_KEY);
  },
};
