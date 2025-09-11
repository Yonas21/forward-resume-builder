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
    // Debug: Log original skills
    console.log('Original skills:', resume.skills);
    console.log('First skill type:', typeof resume.skills[0]);
    console.log('First skill:', resume.skills[0]);
    
    // Convert Skill objects to strings and filter out non-updatable fields
    const convertedSkills = Array.isArray(resume.skills) 
      ? resume.skills
          .filter((s: any) => {
            // Handle different skill formats
            if (typeof s === 'string') {
              return s.trim() !== '';
            }
            if (s && typeof s === 'object' && s.name) {
              return typeof s.name === 'string' && s.name.trim() !== '';
            }
            return false;
          })
          .map((s: any) => {
            // Convert to string - this is the key part
            if (typeof s === 'string') {
              return s;
            }
            if (s && typeof s === 'object' && s.name) {
              return s.name; // Return the name directly as string
            }
            return String(s);
          })
      : [];
    
    console.log('Converted skills:', convertedSkills);
    console.log('First converted skill type:', typeof convertedSkills[0]);
    
    const backendResume = {
      title: resume.title,
      personal_info: resume.personal_info,
      professional_summary: resume.professional_summary,
      skills: convertedSkills,
      experience: resume.experience,
      education: resume.education,
      projects: resume.projects,
      certifications: resume.certifications,
      template_id: resume.template_id,
      font_family: resume.font_family,
      accent_color: resume.accent_color,
    };
    
    console.log('Backend resume skills:', backendResume.skills);
    
    // Final validation: ensure all skills are strings
    const validatedSkills = backendResume.skills.map((skill: any) => {
      if (typeof skill !== 'string') {
        console.warn('Non-string skill found:', skill, 'converting to string');
        if (skill && typeof skill === 'object' && skill.name) {
          return skill.name; // Return name directly
        }
        return String(skill);
      }
      return skill;
    });
    
    const finalBackendResume = {
      ...backendResume,
      skills: validatedSkills
    };
    
    console.log('Final backend resume skills:', finalBackendResume.skills);
    console.log('Final skills types:', finalBackendResume.skills.map(s => typeof s));
    
    const response: AxiosResponse<Resume> = await apiClient.put(
      `/resumes/my-resume`,
      finalBackendResume
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
