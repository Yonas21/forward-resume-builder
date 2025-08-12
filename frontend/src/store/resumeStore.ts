import { create } from 'zustand';
import type { Resume, PersonalInfo, Experience, Education, Project, Certification, Skill } from '../types';
import { resumeService } from '../services/resumeService';
import { sampleResume } from '../data/sample';

// Define the state shape and actions
interface ResumeState {
  resume: Resume;
  setResume: (resume: Resume) => void;
  updatePersonalInfo: (field: keyof PersonalInfo, value: string) => void;
  updateProfessionalSummary: (summary: string) => void;
  addExperience: () => void;
  updateExperience: (index: number, updates: Partial<Experience>) => void;
  deleteExperience: (index: number) => void;
  addEducation: () => void;
  updateEducation: (index: number, updates: Partial<Education>) => void;
  deleteEducation: (index: number) => void;
  addProject: () => void;
  updateProject: (index: number, updates: Partial<Project>) => void;
  deleteProject: (index: number) => void;
  addCertification: () => void;
  updateCertification: (index: number, updates: Partial<Certification>) => void;
  deleteCertification: (index: number) => void;
  updateSkills: (skills: Skill[]) => void;
  fetchUserResume: (userId: string) => Promise<void>;
}

const initialResume: Resume = {
  personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
  professional_summary: '',
  skills: [],
  experience: [],
  education: [],
  projects: [],
  certifications: []
};

export const useResumeStore = create<ResumeState>()(
  (set) => ({
    resume: initialResume,
      
      setResume: (resume) => set({ resume }),

      updatePersonalInfo: (field, value) => set(state => ({
        resume: { ...state.resume, personal_info: { ...state.resume.personal_info, [field]: value } }
      })),

      updateProfessionalSummary: (summary) => set(state => ({
        resume: { ...state.resume, professional_summary: summary }
      })),

      addExperience: () => set(state => ({
        resume: { ...state.resume, experience: [...state.resume.experience, { company: '', position: '', start_date: '', end_date: '', description: [''], is_current: false }] }
      })),
      updateExperience: (index, updates) => set(state => ({
        resume: { ...state.resume, experience: state.resume.experience.map((exp, i) => i === index ? { ...exp, ...updates } : exp) }
      })),
      deleteExperience: (index) => set(state => ({
        resume: { ...state.resume, experience: state.resume.experience.filter((_, i) => i !== index) }
      })),

      addEducation: () => set(state => ({
        resume: { ...state.resume, education: [...state.resume.education, { institution: '', degree: '', field_of_study: '', start_date: '', end_date: '', gpa: '' }] }
      })),
      updateEducation: (index, updates) => set(state => ({
        resume: { ...state.resume, education: state.resume.education.map((edu, i) => i === index ? { ...edu, ...updates } : edu) }
      })),
      deleteEducation: (index) => set(state => ({
        resume: { ...state.resume, education: state.resume.education.filter((_, i) => i !== index) }
      })),

      addProject: () => set(state => ({
        resume: { ...state.resume, projects: [...state.resume.projects, { name: '', description: '', technologies: [], url: '' }] }
      })),
      updateProject: (index, updates) => set(state => ({
        resume: { ...state.resume, projects: state.resume.projects.map((proj, i) => i === index ? { ...proj, ...updates } : proj) }
      })),
      deleteProject: (index) => set(state => ({
        resume: { ...state.resume, projects: state.resume.projects.filter((_, i) => i !== index) }
      })),

      addCertification: () => set(state => ({
        resume: { ...state.resume, certifications: [...state.resume.certifications, { name: '', issuing_organization: '', issue_date: '', credential_id: '' }] }
      })),
      updateCertification: (index, updates) => set(state => ({
        resume: { ...state.resume, certifications: state.resume.certifications.map((cert, i) => i === index ? { ...cert, ...updates } : cert) }
      })),
      deleteCertification: (index) => set(state => ({
        resume: { ...state.resume, certifications: state.resume.certifications.filter((_, i) => i !== index) }
      })),

      updateSkills: (skills) => set(state => ({
        resume: { ...state.resume, skills }
      })),

      fetchUserResume: async (userId: string) => {
        try {
          const userResumes = await resumeService.getUserResumes(userId);
          if (userResumes.resumes.length > 0) {
            // Assuming we want to load the first resume if multiple exist
            const firstResume = userResumes.resumes[0];
            set({ resume: firstResume });
          } else {
            // No resumes found, initialize with sample data
            set({ resume: sampleResume });
          }
        } catch (error) {
          console.error("Failed to fetch user resumes:", error);
          // Fallback to sample data on error as well
          set({ resume: sampleResume });
        }
      },
    })
);