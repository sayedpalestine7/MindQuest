import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants';

const TOKEN_KEY = 'mindquest_token';

export const apiClient = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 15000,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const tokenStorage = {
  async get() {
    return SecureStore.getItemAsync(TOKEN_KEY);
  },
  async set(token) {
    if (!token) return;
    return SecureStore.setItemAsync(TOKEN_KEY, token);
  },
  async clear() {
    return SecureStore.deleteItemAsync(TOKEN_KEY);
  },
};
