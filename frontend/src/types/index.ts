export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description: string[];
  is_current: boolean;
}

export interface Education {
  institution: string;
  degree: string;
  field_of_study?: string;
  start_date?: string;
  end_date?: string;
  gpa?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url?: string;
}

export interface Certification {
  name: string;
  issuing_organization: string;
  issue_date?: string;
  expiration_date?: string;
  credential_id?: string;
}

export interface Skill {
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Resume {
  personal_info: PersonalInfo;
  professional_summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: Certification[];
}

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
}

export interface OptimizeResumeRequest {
  resume: Resume;
  job_description: JobDescription;
}

export interface GenerateResumeRequest {
  job_description: JobDescription;
  user_background?: string;
}
