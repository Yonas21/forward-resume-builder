import apiClient from './apiClient';
import type { Resume, OptimizeResumeRequest, GenerateResumeRequest, Skill } from '../types';
import type { SignupRequest, LoginRequest, AuthResponse } from '../types/auth';

// Helpers to map between backend <-> frontend skill shapes
const mapSkillsFromBackend = (skills: unknown): Skill[] => {
  if (!Array.isArray(skills)) return [];
  return skills.map((s) => {
    if (typeof s === 'string') {
      return { name: s, category_id: 'programming', category: 'Programming Languages', level: 'intermediate' as const };
    }
    return s as Skill; // assume already proper shape
  });
};

const mapResumeFromBackend = (data: Partial<Resume>): Resume => {
  return {
    ...data,
    skills: mapSkillsFromBackend(data?.skills),
  } as Resume;
};

const mapResumeToBackend = (resume: Resume) => {
  return {
    ...resume,
    skills: Array.isArray(resume.skills) 
      ? resume.skills
          .filter((s) => s && s.name && s.name.trim() !== '') // Filter out null/empty skills
          .map((s) => ({
            name: s.name,
            category_id: s.category_id || 'programming',
            category: s.category || 'Programming Languages',
            level: s.level || 'intermediate'
          })) 
      : [],
  };
};

export const apiService = {
  // Signup
  signup: async (userData: SignupRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/signup', userData);
    return response.data;
  },

  // Login
  login: async (userData: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post('/auth/login', userData);
    return response.data;
  },

  parseAndSaveResume: async (file: File): Promise<Resume> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/resumes/ai/parse-and-save-resume', formData, {
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
    const response = await apiClient.post('/resumes/ai/optimize-resume', payload);
    return mapResumeFromBackend(response.data);
  },

  // Generate resume from job description
  generateResume: async (request: GenerateResumeRequest): Promise<Resume> => {
    const response = await apiClient.post('/resumes/ai/generate-resume', request);
    return mapResumeFromBackend(response.data);
  },
};
