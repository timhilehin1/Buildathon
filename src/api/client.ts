import { useAuthStore } from '@/src/store/auth-store';
import axios from 'axios';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use(async (config) => {
  const store = useAuthStore.getState();
  let session = store.session;

  if (session) {
    const expiresIn = session.expiresAt - Math.floor(Date.now() / 1000);
    if (expiresIn < 300) {
      await store.refreshSession();
      session = useAuthStore.getState().session;
    }
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await useAuthStore.getState().signOut();
    }
    return Promise.reject(error);
  }
);
