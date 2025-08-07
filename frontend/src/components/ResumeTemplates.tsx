import React from 'react';
import type { Resume } from '../types';
import CategorizedSkillsDisplay from './CategorizedSkillsDisplay';

// Helper function to render sections in order
const renderSection = (sectionKey: string, resume: any, color: string) => {
  switch (sectionKey) {
    case 'personal':
      return (
        <div className="text-center mb-6">
          <h1 className={`text-2xl font-bold mb-1`} style={{ color }}>
            {resume.personal_info?.full_name || '[Your Name]'}
          </h1>
          <div className="flex justify-center flex-wrap gap-x-4 text-gray-600">
            {resume.personal_info?.email && <span>{resume.personal_info.email}</span>}
            {resume.personal_info?.phone && <span>{resume.personal_info.phone}</span>}
            {resume.personal_info?.location && <span>{resume.personal_info.location}</span>}
            {resume.personal_info?.linkedin && <span>{resume.personal_info.linkedin}</span>}
            {resume.personal_info?.github && <span>{resume.personal_info.github}</span>}
            {resume.personal_info?.website && <span>{resume.personal_info.website}</span>}
          </div>
        </div>
      );
    case 'summary':
      return resume.professional_summary ? (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-1 border-b`} style={{ color }}>
            Professional Summary
          </h2>
          <p>{resume.professional_summary}</p>
        </div>
      ) : null;
    case 'experience':
      return resume?.experience?.length > 0 ? (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Experience
          </h2>
          {resume.experience.map((exp: any, index: number) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <h3 className="font-medium">{exp?.position}</h3>
                <span className="text-gray-600">
                  {exp.start_date && new Date(exp.start_date).getFullYear()}{' '}
                  {exp.end_date
                    ? `- ${new Date(exp.end_date).getFullYear()}`
                    : exp.is_current
                    ? '- Present'
                    : ''}
                </span>
              </div>
              <p className="text-gray-700">{exp.company}</p>
              <ul className="list-disc pl-5 mt-1">
                {exp.description.map((desc: string, i: number) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null;
    case 'education':
      return resume.education.length > 0 ? (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu: any, index: number) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{edu.institution}</h3>
                <span className="text-gray-600">
                  {edu.start_date && new Date(edu.start_date).getFullYear()}{' '}
                  {edu.end_date && `- ${new Date(edu.end_date).getFullYear()}`}
                </span>
              </div>
              <p>
                {edu.degree}
                {edu.field_of_study && `, ${edu.field_of_study}`}
                {edu.gpa && ` - GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </div>
      ) : null;
    case 'skills':
      return resume?.skills?.length > 0 ? (
        <CategorizedSkillsDisplay 
          skills={resume.skills}
          color={color}
          variant="detailed"
          showLevels={true}
        />
      ) : null;
    case 'projects':
      return resume.projects.length > 0 ? (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Projects
          </h2>
          {resume.projects.map((project: any, index: number) => (
            <div key={index} className="mb-2">
              <h3 className="font-medium">
                {project.name}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 ml-2 text-sm"
                  >
                    [Link]
                  </a>
                )}
              </h3>
              <p className="text-sm">{project.description}</p>
              {project?.technologies?.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Technologies: {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : null;
    case 'certifications':
      return resume.certifications.length > 0 ? (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Certifications
          </h2>
          {resume.certifications.map((cert: any, index: number) => (
            <div key={index} className="mb-2">
              <span className="font-medium">{cert.name}</span>
              <span className="text-gray-600 ml-2">
                {cert.issuing_organization}
                {cert.issue_date &&
                  ` (${new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`}
              </span>
            </div>
          ))}
        </div>
      ) : null;
    default:
      return null;
  }
};

export interface TemplateProps {
  resume: Resume;
  color: string;
  font: string;
  sectionOrder?: string[];
}

export interface TemplateOption {
  id: string;
  name: string;
  profession: string;
  component: React.FC<TemplateProps>;
  thumbnail: string;
}

// Basic Template - Good for most professions
const BasicTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Modern Template - Clean and contemporary design
const ModernTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Professional Template - Traditional business style
const ProfessionalTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Technical Template - For software developers and engineers
const TechnicalTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Data Analyst Template - For data professionals
const DataAnalystTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Data Engineer Template - For data engineering roles
const DataEngineerTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Marketing Template - For marketing professionals
const MarketingTemplate: React.FC<TemplateProps> = ({ resume, color, font, sectionOrder = ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'] }) => {
  return (
    <div className={`${font} text-sm max-w-4xl mx-auto bg-white p-8 shadow-lg`}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color))}
    </div>
  );
};

// Export all templates
export const templates: TemplateOption[] = [
  {
    id: 'basic',
    name: 'Basic',
    profession: 'General',
    component: BasicTemplate,
    thumbnail: '📄'
  },
  {
    id: 'modern',
    name: 'Modern',
    profession: 'General',
    component: ModernTemplate,
    thumbnail: '✨'
  },
  {
    id: 'professional',
    name: 'Professional',
    profession: 'Business',
    component: ProfessionalTemplate,
    thumbnail: '💼'
  },
  {
    id: 'technical',
    name: 'Technical',
    profession: 'Software Development',
    component: TechnicalTemplate,
    thumbnail: '💻'
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    profession: 'Data Science',
    component: DataAnalystTemplate,
    thumbnail: '📊'
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    profession: 'Data Engineering',
    component: DataEngineerTemplate,
    thumbnail: '🔧'
  },
  {
    id: 'marketing',
    name: 'Marketing',
    profession: 'Marketing',
    component: MarketingTemplate,
    thumbnail: '📈'
  }
];

export default templates;
