import { type AxiosResponse } from 'axios';
import type { Resume } from '../types';
import apiClient from './apiClient';

interface ResumeListResponse {
  resumes: Resume[];
  total_count: number;
}

class ResumeService {
  async getMyResume(): Promise<Resume> {
    const response: AxiosResponse<Resume> = await apiClient.get(
      `/resumes/my-resume`
    );
    return response.data;
  }

  async getUserResumes(userId: string): Promise<ResumeListResponse> {
    const response: AxiosResponse<ResumeListResponse> = await apiClient.get(
      `/resumes`,
      { params: { userId } } // Pass userId as a query parameter if needed by backend
    );
    return response.data;
  }
}

export const resumeService = new ResumeService();
export default resumeService;
