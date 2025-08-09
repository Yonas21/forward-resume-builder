import axios from 'axios';
import type { Resume, OptimizeResumeRequest, GenerateResumeRequest, Skill } from '../types';
import type { SignupRequest, LoginRequest, AuthResponse, UserResponse } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helpers to map between backend <-> frontend skill shapes
const mapSkillsFromBackend = (skills: unknown): Skill[] => {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => {
    if (typeof s === 'string') {
      return { name: s, category: 'technical', level: 'intermediate' as const };
    }
    return s as Skill; // assume already proper shape
  });
};

const mapResumeFromBackend = (data: any): Resume => {
  return {
    ...data,
    skills: mapSkillsFromBackend(data?.skills),
  } as Resume;
};

const mapResumeToBackend = (resume: Resume) => {
  return {
    ...resume,
    skills: Array.isArray(resume.skills) ? resume.skills.map((s) => s.name) : [],
  };
};

export const apiService = {
  // Signup
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  // Login
  login: async (userData: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', userData);
    return response.data;
  },

  // Parse resume from file
  parseResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/resumes/ai/parse-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return mapResumeFromBackend(response.data);
  },

  // Optimize resume for job description
  optimizeResume: async (request: OptimizeResumeRequest): Promise<Resume> => {
    const payload = {
      ...request,
      resume: mapResumeToBackend(request.resume),
    };
    const response = await api.post('/resumes/ai/optimize-resume', payload);
    return mapResumeFromBackend(response.data);
  },

  // Generate resume from job description
  generateResume: async (request: GenerateResumeRequest): Promise<Resume> => {
    const response = await api.post('/resumes/ai/generate-resume', request);
    return mapResumeFromBackend(response.data);
  },
};
