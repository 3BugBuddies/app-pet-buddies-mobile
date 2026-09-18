import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

const SESSION_KEY = 'SESSION';

type Listener = () => void;
const listeners = new Set<Listener>();

export const onSessionExpired = (listener: Listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const addAuthInterceptor = (instance: ReturnType<typeof axios.create>) => {
  instance.interceptors.request.use(async (config) => {
    try {
      const raw = await SecureStore.getItemAsync(SESSION_KEY);
      if (raw != null) {
        const session = JSON.parse(raw);
        if (session?.token) {
          config.headers['Authorization'] = `Bearer ${session.token}`;
        }
      }
    } catch {
    }
    return config;
  });
}

const apiJava = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL
});
addAuthInterceptor(apiJava);

apiJava.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config.url?.endsWith('/auth/login')) {
      if (listeners.size > 0) {
        listeners.forEach(l => l());
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
    }
    return Promise.reject(error);
  }
);

export { apiJava };
