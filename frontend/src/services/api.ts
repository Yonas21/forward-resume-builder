import axios from 'axios';
import { Resume, OptimizeResumeRequest, GenerateResumeRequest } from '../types';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
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
