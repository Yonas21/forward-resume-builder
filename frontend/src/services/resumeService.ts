import axios,  { type AxiosResponse } from 'axios';
import type { Resume } from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000';

interface ResumeListResponse {
  resumes: Resume[];
  total_count: number;
}

class ResumeService {
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

  async getUserResumes(userId: string): Promise<ResumeListResponse> {
    try {
      const response: AxiosResponse<ResumeListResponse> = await axios.get(
        `${API_BASE_URL}/resumes`,
        { params: { userId } } // Pass userId as a query parameter if needed by backend
      );
      return response.data;
    } catch (error: any) {
      throw this.handleError(error);
    }
  }
}

export const resumeService = new ResumeService();
export default resumeService;
