import { type AxiosResponse } from 'axios';
import type { Resume } from '../types';
import apiClient from './apiClient';

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
    return response.data;
  }

  async getUserResumes(page: number = 1, limit: number = 20): Promise<ResumeListResponse> {
    const response: AxiosResponse<ResumeListResponse> = await apiClient.get(
      `/resumes`,
      { params: { page, limit } }
    );
    return response.data;
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
    return response.data;
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
