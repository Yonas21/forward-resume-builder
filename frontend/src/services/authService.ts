import axios, { type AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore'; // Import the zustand store

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

// Request interceptor to add token to headers
axios.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.url?.startsWith(API_BASE_URL)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle 401 errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Use the logout action from the store
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface SignupRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  is_active: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: UserResponse;
}

class AuthService {
  private handleError(error: any): Error {
    if (error.response?.data?.detail) {
      if (typeof error.response.data.detail === 'string') {
        return new Error(error.response.data.detail);
      }
      if (Array.isArray(error.response.data.detail)) {
        const messages = error.response.data.detail.map((err: any) => 
          err.msg || err.message || JSON.stringify(err)
        );
        return new Error(messages.join(', '));
      }
    }
    
    if (error.response?.status === 422) {
      return new Error('Please check your input and try again');
    }
    
    if (error.response?.status >= 500) {
      return new Error('Server error. Please try again later.');
    }
    
    return new Error(error.message || 'An unexpected error occurred');
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        userData
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/auth/login`,
        credentials
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // We still call the backend logout endpoint, but state is managed by the store
      await axios.post(`${API_BASE_URL}/auth/logout`);
    } catch (error) {
      // The store will handle the local state cleanup regardless of API success
      console.error('Logout API error:', error);
      throw error; // re-throw to be caught in the store action
    }
  }

  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response: AxiosResponse<UserResponse> = await axios.get(
        `${API_BASE_URL}/auth/me`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;