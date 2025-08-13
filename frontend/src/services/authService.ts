import { type AxiosResponse, isAxiosError } from 'axios';
import apiClient from './apiClient';

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
  private handleError(error: unknown): Error {
    if (isAxiosError(error)) {
      if (error.response?.data?.detail) {
        if (typeof error.response.data.detail === 'string') {
          return new Error(error.response.data.detail);
        }
        if (Array.isArray(error.response.data.detail)) {
          const messages = error.response.data.detail.map((err: { msg: string; message: string; }) =>
            err.msg || err.message || JSON.stringify(err)
          );
          return new Error(messages.join(', '));
        }
      }
      if (error.response) {
        if (error.response.status === 422) {
          return new Error('Please check your input and try again');
        }
        if (error.response.status >= 500) {
          return new Error('Server error. Please try again later.');
        }
      }
    }
    if (error instanceof Error) {
      return new Error(error.message || 'An unexpected error occurred');
    }
    return new Error('An unexpected error occurred');
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        `/auth/signup`,
        userData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        `/auth/login`,
        credentials
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      // We still call the backend logout endpoint, but state is managed by the store
      await apiClient.post(`/auth/logout`);
    } catch (error) {
      // The store will handle the local state cleanup regardless of API success
      console.error('Logout API error:', error);
      throw error; // re-throw to be caught in the store action
    }
  }

  async getCurrentUser(): Promise<UserResponse> {
    try {
      const response: AxiosResponse<UserResponse> = await apiClient.get(
        `/auth/me`
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async googleLogin(tokenData: { token: string }): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await apiClient.post(
        `/auth/google/login`,
        tokenData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
