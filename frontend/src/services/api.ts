import apiClient from './apiClient';
import type { Resume, OptimizeResumeRequest, GenerateResumeRequest, Skill } from '../types';
import type { SignupRequest, LoginRequest, AuthResponse } from '../types/auth';

// Helpers to map between backend <-> frontend skill shapes
export const mapSkillsFromBackend = (skills: unknown): Skill[] => {
  if (!Array.isArray(skills)) return [];
  
  const categorizeSkill = (skillName: string): { category_id: string; category: string; level: 'beginner' | 'intermediate' | 'advanced' | 'expert' } => {
    const name = skillName.toLowerCase();
    
    // Programming Languages
    if (['javascript', 'typescript', 'python', 'go', 'php', 'java', 'c++', 'c#', 'ruby', 'swift', 'kotlin', 'rust', 'scala'].includes(name)) {
      return { category_id: 'programming', category: 'Programming Languages', level: 'intermediate' };
    }
    
    // Frameworks & Libraries
    if (['react', 'vue.js', 'angular', 'next.js', 'nuxt.js', 'django', 'fastapi', 'express', 'spring', 'laravel', 'rails', 'flask', 'node.js'].includes(name)) {
      return { category_id: 'frameworks', category: 'Frameworks & Libraries', level: 'intermediate' };
    }
    
    // Frontend Technologies
    if (['html5', 'css3', 'tailwind css', 'material-ui', 'bootstrap', 'sass', 'less', 'styled-components', 'radix ui'].includes(name)) {
      return { category_id: 'frontend', category: 'Frontend Technologies', level: 'intermediate' };
    }
    
    // Backend & APIs
    if (['rest', 'graphql', 'trpc', 'grpc', 'soap', 'websockets'].includes(name)) {
      return { category_id: 'backend', category: 'Backend & APIs', level: 'intermediate' };
    }
    
    // Databases
    if (['postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'firebase', 'sqlalchemy'].includes(name)) {
      return { category_id: 'databases', category: 'Databases', level: 'intermediate' };
    }
    
    // Cloud & DevOps
    if (['aws', 'gcp', 'azure', 'docker', 'kubernetes', 'terraform', 'jenkins', 'github actions', 'ci/cd', 'prometheus'].includes(name)) {
      return { category_id: 'devops', category: 'Cloud & DevOps', level: 'intermediate' };
    }
    
    // Tools & Platforms
    if (['git', 'github', 'gitlab', 'bitbucket', 'slack', 'notion', 'jira', 'zoom', 'clickup', 'datadog', 'swr'].includes(name)) {
      return { category_id: 'tools', category: 'Tools & Platforms', level: 'intermediate' };
    }
    
    // Methodologies & Practices
    if (['agile', 'scrum', 'tdd', 'code reviews', 'debugging', 'remote collaboration', 'pair programming'].includes(name)) {
      return { category_id: 'methodologies', category: 'Methodologies & Practices', level: 'intermediate' };
    }
    
    // Default fallback
    return { category_id: 'programming', category: 'Programming Languages', level: 'intermediate' };
  };
  
  return skills.map((s) => {
    if (typeof s === 'string') {
      const category = categorizeSkill(s);
      return { 
        name: s, 
        category_id: category.category_id, 
        category: category.category, 
        level: category.level
      };
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
          .map((s) => s.name) // Convert Skill objects to strings for backend
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
