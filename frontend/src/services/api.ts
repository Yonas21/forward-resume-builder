import axios from 'axios';
import type { Resume, OptimizeResumeRequest, GenerateResumeRequest } from '../types';
import type { SignupRequest, LoginRequest, AuthResponse } from '../types/auth';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Signup
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/signup', userData);
    return response.data;
  },

  // Login
  login: async (userData: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/login', userData);
    return response.data;
  },

  // Parse resume from file
  parseResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  // Optimize resume for job description
  optimizeResume: async (request: OptimizeResumeRequest): Promise<Resume> => {
    const response = await api.post('/optimize-resume', request);
    return response.data;
  },

  // Generate resume from job description
  generateResume: async (request: GenerateResumeRequest): Promise<Resume> => {
    const response = await api.post('/generate-resume', request);
    return response.data;
  },
};
