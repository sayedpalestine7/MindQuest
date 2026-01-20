import axios from 'axios';
import { platformStorage } from '../auth/storage';
import { API_URL } from '../constants';

const TOKEN_KEY = 'mindquest_token';

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
