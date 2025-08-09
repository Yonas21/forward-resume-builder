import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

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
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
    this.setupAxiosInterceptors();
  }

  private setupAxiosInterceptors() {
    // Request interceptor to add token to headers
    axios.interceptors.request.use(
      (config) => {
        if (this.token && config.url?.startsWith(API_BASE_URL)) {
          config.headers.Authorization = `Bearer ${this.token}`;
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
          this.logout();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  async signup(userData: SignupRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<AuthResponse> = await axios.post(
        `${API_BASE_URL}/auth/signup`,
        userData
      );
      
      const authData = response.data;
      this.setAuthData(authData);
      return authData;
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
      
      const authData = response.data;
      this.setAuthData(authData);
      return authData;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/auth/logout`);
      }
    } catch (error) {
      // Ignore logout errors, still remove local data
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
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

  private setAuthData(authData: AuthResponse): void {
    this.token = authData.access_token;
    localStorage.setItem('authToken', this.token);
    localStorage.setItem('userData', JSON.stringify(authData.user));
  }

  private clearAuthData(): void {
    this.token = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  }

  getToken(): string | null {
    return this.token;
  }

  getUser(): UserResponse | null {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

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
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
