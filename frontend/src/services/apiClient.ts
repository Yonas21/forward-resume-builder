import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const API_BASE_URL = (import.meta as ImportMeta).env?.VITE_API_BASE_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // allow cookies for refresh flow
});

apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Try refresh token flow once
      if (!error.config.__isRetryRequest) {
        error.config.__isRetryRequest = true;
        const csrf = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )csrf_token=([^;]+)/)?.[1] || '') : '';
        return axios
          .post(`${API_BASE_URL}/auth/refresh-token`, null, { withCredentials: true, headers: { 'x-csrf-token': csrf } })
          .then((res) => {
            const newToken = res.data?.access_token;
            if (newToken) {
              useAuthStore.getState().setAuthData(newToken, res.data.user);
              error.config.headers = error.config.headers || {};
              error.config.headers.Authorization = `Bearer ${newToken}`;
              return apiClient.request(error.config);
            }
            return Promise.reject(error);
          })
          .catch(() => {
            // Fall through to logout below
          });
      }
      // Preserve SPA state and show a friendly message via store/UI
      useAuthStore.getState().logout();
      try {
        sessionStorage.setItem('auth_message', 'Your session expired. Please sign in again.');
      } catch {}
      // Soft redirect so router can show message on the login page
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', '/login');
        // Fire a popstate to notify router in some setups; safe no-op otherwise
        window.dispatchEvent(new PopStateEvent('popstate'));
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
