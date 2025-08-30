import { type AxiosResponse } from 'axios';
import type { Resume } from '../types';
import apiClient from './apiClient';

// Import the mapping function from apiService
import { mapSkillsFromBackend } from './api';

interface ResumeListResponse {
  resumes: Resume[];
  total_count: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

class ResumeService {
  async getMyResume(): Promise<Resume> {
    const response: AxiosResponse<Resume> = await apiClient.get(
      `/resumes/my-resume`
    );
    // Apply skill mapping to convert string skills to Skill objects
    return {
      ...response.data,
      skills: mapSkillsFromBackend(response.data.skills),
    };
  }

  async getUserResumes(page: number = 1, limit: number = 20): Promise<ResumeListResponse> {
    const response: AxiosResponse<ResumeListResponse> = await apiClient.get(
      `/resumes`,
      { params: { page, limit } }
    );
    // Apply skill mapping to each resume in the list
    return {
      ...response.data,
      resumes: response.data.resumes.map(resume => ({
        ...resume,
        skills: mapSkillsFromBackend(resume.skills),
      })),
    };
  }

  async generateCoverLetter(resume: Resume, jobDescription: { title: string, company: string, description: string, requirements: string[] }): Promise<{ cover_letter: string }> {
    const response: AxiosResponse<{ cover_letter: string }> = await apiClient.post(
      '/resumes/ai/generate-cover-letter',
      { resume, job_description: jobDescription }
    );
    return response.data;
  }

  async updateResume(resume: Resume): Promise<Resume> {
    const response: AxiosResponse<Resume> = await apiClient.put(
      `/resumes/my-resume`,
      resume
    );
    // Apply skill mapping to the updated resume
    return {
      ...response.data,
      skills: mapSkillsFromBackend(response.data.skills),
    };
  }

  async scoreResume(resume: Resume, jobDescription?: string): Promise<{ score: number; feedback: string[]; suggestions: string[] }> {
    const response: AxiosResponse<{ score: number; feedback: string[]; suggestions: string[] }> = await apiClient.post(
      '/resumes/score',
      { 
        resume: resume, 
        job_description: jobDescription 
      }
    );
    return response.data;
  }
}

export const resumeService = new ResumeService();
export default resumeService;
