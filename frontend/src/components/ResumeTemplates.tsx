import React from 'react';
import type { Resume } from '../types';
import CategorizedSkillsDisplay from './CategorizedSkillsDisplay';

// Helper function to render sections in order
const renderSection = (sectionKey: string, resume: any, color: string) => {
  switch (sectionKey) {
    case 'personal':
      return (
        <header className="text-center mb-6">
          <h1 className={`text-3xl font-bold tracking-tight mb-1`} style={{ color }}>
            {resume.personal_info?.full_name || '[Your Name]'}
          </h1>
          <div className="flex justify-center flex-wrap gap-x-4 text-gray-600 text-sm">
            {resume.personal_info?.email && <span>{resume.personal_info.email}</span>}
            {resume.personal_info?.phone && <span>{resume.personal_info.phone}</span>}
            {resume.personal_info?.location && <span>{resume.personal_info.location}</span>}
            {resume.personal_info?.linkedin && <span>{resume.personal_info.linkedin}</span>}
            {resume.personal_info?.github && <span>{resume.personal_info.github}</span>}
            {resume.personal_info?.website && <span>{resume.personal_info.website}</span>}
          </div>
        </header>
      );
    case 'summary':
      return resume.professional_summary ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-2 border-b border-gray-200`} style={{ color }}>
            Professional Summary
          </h2>
          <p className="leading-relaxed text-gray-800">{resume.professional_summary}</p>
        </section>
      ) : null;
    case 'experience':
      return resume?.experience?.length > 0 ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Experience
          </h2>
          {resume.experience.map((exp: any, index: number) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900">{exp?.position}</h3>
                <span className="text-gray-600 text-sm">
                  {exp.start_date || ''}
                  {(exp.is_current || exp.end_date) && ' - '}
                  {exp.is_current ? 'Present' : (exp.end_date || '')}
                </span>
              </div>
              <p className="text-gray-700 text-sm">{exp.company}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {exp.description.map((desc: string, i: number) => (
                  <li key={i} className="text-gray-800 leading-relaxed">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null;
    case 'education':
      return resume.education.length > 0 ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu: any, index: number) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold text-gray-900">{edu.institution}</h3>
                <span className="text-gray-600 text-sm">
                  {edu.start_date || ''}
                  {edu.end_date && ` - ${edu.end_date}`}
                </span>
              </div>
              <p className="text-gray-800 text-sm">
                {edu.degree}
                {edu.field_of_study && `, ${edu.field_of_study}`}
                {edu.gpa && ` - GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </section>
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
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Projects
          </h2>
          {resume.projects.map((project: any, index: number) => (
            <div key={index} className="mb-3">
              <h3 className="font-semibold text-gray-900">
                {project.name}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 ml-2 text-sm hover:underline"
                  >
                    [Link]
                  </a>
                )}
              </h3>
              <p className="text-sm text-gray-800 leading-relaxed">{project.description}</p>
              {project?.technologies?.length > 0 && (
                <div className="text-sm text-gray-600 mt-1">
                  Technologies: {project.technologies.join(', ')}
                </div>
              )}
            </div>
          ))}
        </section>
      ) : null;
    case 'certifications':
      return resume.certifications.length > 0 ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Certifications
          </h2>
          {resume.certifications.map((cert: any, index: number) => (
            <div key={index} className="mb-2">
              <span className="font-medium text-gray-900">{cert.name}</span>
              <span className="text-gray-600 ml-2 text-sm">
                {cert.issuing_organization}
                {cert.issue_date &&
                  ` (${new Date(cert.issue_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })})`}
              </span>
            </div>
          ))}
        </section>
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
