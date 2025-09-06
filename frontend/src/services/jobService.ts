import apiClient from './apiClient';
import type { Resume } from '../types';

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  requirements: string[];
  skills: string[];
  salary_range?: string;
  job_type: string;
  experience_level: string;
  posted_date: string;
  application_url: string;
  source: string;
  remote: boolean;
  match_score?: number;
}

export interface JobSearchRequest {
  skills: string[];
  location?: string;
  remote: boolean;
  limit: number;
  min_salary?: number;
  max_salary?: number;
  job_type?: string;
  experience_level?: string;
}

export interface JobSearchResponse {
  jobs: JobPosting[];
  total_count: number;
  filters_applied: Record<string, any>;
}

export interface JobMatchAnalysis {
  job_id: string;
  overall_match: number;
  skill_matches: string[];
  missing_skills: string[];
  recommendations: string[];
  match_breakdown: Record<string, number>;
}

export interface JobSource {
  name: string;
  description: string;
  url: string;
  active: boolean;
}

class JobService {
  async searchJobs(request: JobSearchRequest): Promise<JobSearchResponse> {
    const response = await apiClient.post('/jobs/search', request);
    console.log(response.data);
    return response.data;
  }

  async searchJobsGet(
    skills: string,
    location?: string,
    remote: boolean = true,
    limit: number = 50,
    min_salary?: number,
    max_salary?: number,
    job_type?: string,
    experience_level?: string
  ): Promise<JobSearchResponse> {
    const params = new URLSearchParams();
    params.append('skills', skills);
    if (location) params.append('location', location);
    params.append('remote', remote.toString());
    params.append('limit', limit.toString());
    if (min_salary) params.append('min_salary', min_salary.toString());
    if (max_salary) params.append('max_salary', max_salary.toString());
    if (job_type) params.append('job_type', job_type);
    if (experience_level) params.append('experience_level', experience_level);

    const response = await apiClient.get(`/jobs/search?${params.toString()}`);
    return response.data;
  }

  async searchJobsByResume(
    location?: string,
    remote: boolean = true,
    limit: number = 50,
    min_salary?: number,
    max_salary?: number
  ): Promise<JobSearchResponse> {
    const params = new URLSearchParams();
    if (location) params.append('location', location);
    params.append('remote', remote.toString());
    params.append('limit', limit.toString());
    if (min_salary) params.append('min_salary', min_salary.toString());
    if (max_salary) params.append('max_salary', max_salary.toString());

    const response = await apiClient.get(`/jobs/search-by-resume?${params.toString()}`);
    return response.data;
  }

  async analyzeJobMatch(jobId: string): Promise<JobMatchAnalysis> {
    const response = await apiClient.get(`/jobs/${jobId}/analysis`);
    return response.data;
  }

  async getJobSources(): Promise<{ sources: JobSource[] }> {
    const response = await apiClient.get('/jobs/sources');
    return response.data;
  }

  async searchJobsByResumeSkills(resume: Resume, filters?: Partial<JobSearchRequest>): Promise<JobSearchResponse> {
    if (!resume.skills || resume.skills.length === 0) {
      throw new Error('No skills found in resume');
    }

    const request: JobSearchRequest = {
      skills: resume.skills.map(skill => typeof skill === 'string' ? skill : skill.name),
      location: filters?.location,
      remote: filters?.remote ?? true,
      limit: filters?.limit ?? 50,
      min_salary: filters?.min_salary,
      max_salary: filters?.max_salary,
      job_type: filters?.job_type,
      experience_level: filters?.experience_level
    };

    return this.searchJobs(request);
  }

  async getJobRecommendations(resume: Resume, limit: number = 20): Promise<JobPosting[]> {
    try {
      const response = await this.searchJobsByResumeSkills(resume, { limit });
      return response.jobs.slice(0, limit);
    } catch (error) {
      console.error('Error getting job recommendations:', error);
      return [];
    }
  }

  filterJobs(jobs: JobPosting[], filters: {
    location?: string;
    remote?: boolean;
    min_salary?: number;
    max_salary?: number;
    job_type?: string;
    experience_level?: string;
  }): JobPosting[] {
    return jobs.filter(job => {
      if (filters.location && !job.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
      if (filters.remote !== undefined && job.remote !== filters.remote) {
        return false;
      }
      if (filters.job_type && job.job_type.toLowerCase() !== filters.job_type.toLowerCase()) {
        return false;
      }
      if (filters.experience_level && job.experience_level.toLowerCase() !== filters.experience_level.toLowerCase()) {
        return false;
      }
      if (filters.min_salary || filters.max_salary) {
        const jobSalary = this.extractSalaryValue(job.salary_range);
        if (filters.min_salary && jobSalary < filters.min_salary) {
          return false;
        }
        if (filters.max_salary && jobSalary > filters.max_salary) {
          return false;
        }
      }
      return true;
    });
  }

  sortJobs(jobs: JobPosting[], sortBy: 'match_score' | 'posted_date' | 'salary' | 'company' = 'match_score'): JobPosting[] {
    const sortedJobs = [...jobs];
    
    switch (sortBy) {
      case 'match_score':
        return sortedJobs.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      case 'posted_date':
        return sortedJobs.sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime());
      case 'salary':
        return sortedJobs.sort((a, b) => this.extractSalaryValue(b.salary_range) - this.extractSalaryValue(a.salary_range));
      case 'company':
        return sortedJobs.sort((a, b) => a.company.localeCompare(b.company));
      default:
        return sortedJobs;
    }
  }

  private extractSalaryValue(salaryRange?: string): number {
    if (!salaryRange) return 0;
    const match = salaryRange.match(/\$?(\d+)k?/i);
    return match ? parseInt(match[1]) * 1000 : 0;
  }

  getFilterOptions(jobs: JobPosting[]) {
    const locations = [...new Set(jobs.map(job => job.location))];
    const jobTypes = [...new Set(jobs.map(job => job.job_type))];
    const experienceLevels = [...new Set(jobs.map(job => job.experience_level))];
    
    return {
      locations: locations.sort(),
      jobTypes: jobTypes.sort(),
      experienceLevels: experienceLevels.sort()
    };
  }
}

export const jobService = new JobService();
