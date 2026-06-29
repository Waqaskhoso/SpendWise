import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// In production (served from same server), use relative URL
const baseURL = (typeof window !== 'undefined' && window.location.port !== '5173')
  ? '/api'
  : 'http://localhost:3001/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
