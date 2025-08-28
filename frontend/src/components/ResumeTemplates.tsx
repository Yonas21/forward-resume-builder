import React from 'react';
import type { Resume } from '../types';
import CategorizedSkillsDisplay from './CategorizedSkillsDisplay';

// Default section order with skills after summary
const DEFAULT_SECTION_ORDER = ['personal', 'summary', 'skills', 'experience', 'education', 'projects', 'certifications'];

// Helper function to render sections in order
const renderSection = (sectionKey: string, resume: any, color: string, formatting?: {
  fontSize?: string;
  lineHeight?: string;
  spacing?: string;
  alignment?: string;
  showBorders?: boolean;
  showShadows?: boolean;
}) => {
  switch (sectionKey) {
    case 'personal':
      return (
        <header className="text-center mb-8">
          <h1 className={`text-4xl font-bold tracking-tight mb-3 bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent`} style={{ backgroundImage: `linear-gradient(to right, ${color}, ${color}80)` }}>
            {resume.personal_info?.full_name || '[Your Name]'}
          </h1>
          <div className="flex justify-center flex-wrap gap-x-6 text-gray-600 text-sm">
            {resume.personal_info?.email && <span className="flex items-center"><span className="mr-1">📧</span>{resume.personal_info.email}</span>}
            {resume.personal_info?.phone && <span className="flex items-center"><span className="mr-1">📱</span>{resume.personal_info.phone}</span>}
            {resume.personal_info?.location && <span className="flex items-center"><span className="mr-1">📍</span>{resume.personal_info.location}</span>}
            {resume.personal_info?.linkedin && <span className="flex items-center"><span className="mr-1">💼</span>{resume.personal_info.linkedin}</span>}
            {resume.personal_info?.github && <span className="flex items-center"><span className="mr-1">🐙</span>{resume.personal_info.github}</span>}
            {resume.personal_info?.website && <span className="flex items-center"><span className="mr-1">🌐</span>{resume.personal_info.website}</span>}
          </div>
        </header>
      );
    case 'summary':
      return resume.professional_summary ? (
        <section className={`${formatting?.spacing === 'compact' ? 'mb-4' : formatting?.spacing === 'spacious' ? 'mb-8' : 'mb-6'} ${formatting?.showBorders ? 'border border-gray-200 rounded-lg p-4' : ''}`}>
          <h2 className={`text-xl font-bold pb-2 mb-3 flex items-center ${formatting?.showBorders ? '' : 'border-b-2'}`} style={{ color, borderColor: color }}>
            <span className="mr-2">📝</span>
            Professional Summary
          </h2>
          <p className="leading-relaxed text-gray-800 text-lg">{resume.professional_summary}</p>
        </section>
      ) : null;
    case 'experience':
      return resume?.experience?.length > 0 ? (
        <section className={`${formatting?.spacing === 'compact' ? 'mb-4' : formatting?.spacing === 'spacious' ? 'mb-8' : 'mb-6'} ${formatting?.showBorders ? 'border border-gray-200 rounded-lg p-4' : ''}`}>
          <h2 className={`text-xl font-bold pb-2 mb-4 flex items-center ${formatting?.showBorders ? '' : 'border-b-2'}`} style={{ color, borderColor: color }}>
            <span className="mr-2">💼</span>
            Work Experience
          </h2>
          {resume.experience.map((exp: any, index: number) => (
            <div key={index} className={`${formatting?.spacing === 'compact' ? 'mb-3' : formatting?.spacing === 'spacious' ? 'mb-6' : 'mb-4'} p-4 bg-gray-50 rounded-lg border-l-4`} style={{ borderLeftColor: color }}>
              <div className="flex justify-between items-baseline mb-2">
                <h3 className="font-bold text-gray-900 text-lg">{exp?.position}</h3>
                <span className="text-gray-600 text-sm bg-white px-2 py-1 rounded">
                  {exp.start_date || ''}
                  {(exp.is_current || exp.end_date) && ' - '}
                  {exp.is_current ? 'Present' : (exp.end_date || '')}
                </span>
              </div>
              <p className="text-gray-700 font-semibold mb-2">{exp.company}</p>
              <ul className="list-disc pl-5 space-y-1">
                {exp.description.map((desc: string, i: number) => (
                  <li key={i} className="text-gray-800 leading-relaxed">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      ) : null;
    case 'education':
      return resume?.education?.length > 0 ? (
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
        <section className={`${formatting?.spacing === 'compact' ? 'mb-4' : formatting?.spacing === 'spacious' ? 'mb-8' : 'mb-6'} ${formatting?.showBorders ? 'border border-gray-200 rounded-lg p-4' : ''}`}>
          <CategorizedSkillsDisplay 
            skills={resume.skills}
            color={color}
            variant="detailed"
            showLevels={true}
          />
        </section>
      ) : null;
    case 'projects':
      return resume?.projects?.length > 0 ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Projects
          </h2>
          {resume?.projects?.map((project: any, index: number) => (
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
      return resume?.certifications?.length > 0 ? (
        <section className="mb-6">
          <h2 className={`text-lg font-semibold pb-1 mb-3 border-b border-gray-200`} style={{ color }}>
            Certifications
          </h2>
          {resume?.certifications?.map((cert: any, index: number) => (
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
  fontSize?: string;
  lineHeight?: string;
  spacing?: string;
  alignment?: string;
  showBorders?: boolean;
  showShadows?: boolean;
}

export interface TemplateOption {
  id: string;
  name: string;
  profession: string;
  component: React.FC<TemplateProps>;
  thumbnail: string;
}

// Basic Template - Good for most professions
const BasicTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-xl' : ''} rounded-lg`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Modern Template - Clean and contemporary design
const ModernTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Professional Template - Traditional business style
const ProfessionalTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Technical Template - For software developers and engineers
const TechnicalTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Data Analyst Template - For data professionals
const DataAnalystTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Data Engineer Template - For data engineering roles
const DataEngineerTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Marketing Template - For marketing professionals
const MarketingTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Creative Template - For designers and creative professionals
const CreativeTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-gradient-to-br from-white to-gray-50 p-8 ${showShadows ? 'shadow-2xl' : ''} rounded-2xl border border-gray-100`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Executive Template - For senior management and executives
const ExecutiveTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-5xl mx-auto bg-white p-10 ${showShadows ? 'shadow-xl' : ''} border-l-8`} style={{ textAlign: alignment as any, borderLeftColor: color }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Minimalist Template - Clean and simple design
const MinimalistTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-3xl mx-auto bg-white p-6 ${showShadows ? 'shadow-md' : ''}`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Finance Template - For finance and accounting professionals
const FinanceTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''} border-t-4`} style={{ textAlign: alignment as any, borderTopColor: color }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Healthcare Template - For healthcare professionals
const HealthcareTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''} rounded-lg border-2`} style={{ textAlign: alignment as any, borderColor: color }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
    </div>
  );
};

// Education Template - For teachers and educators
const EducationTemplate: React.FC<TemplateProps> = ({ 
  resume, 
  color, 
  font, 
  sectionOrder = DEFAULT_SECTION_ORDER,
  fontSize = 'text-base',
  lineHeight = 'leading-normal',
  spacing = 'normal',
  alignment = 'left',
  showBorders = false,
  showShadows = false
}) => {
  const formatting = { fontSize, lineHeight, spacing, alignment, showBorders, showShadows };
  
  return (
    <div className={`${font} ${fontSize} ${lineHeight} max-w-4xl mx-auto bg-white p-8 ${showShadows ? 'shadow-lg' : ''} rounded-lg`} style={{ textAlign: alignment as any }}>
      {/* Render sections in order */}
      {sectionOrder.map((sectionKey) => renderSection(sectionKey, resume, color, formatting))}
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
    id: 'minimalist',
    name: 'Minimalist',
    profession: 'General',
    component: MinimalistTemplate,
    thumbnail: '⚪'
  },
  {
    id: 'creative',
    name: 'Creative',
    profession: 'Design & Creative',
    component: CreativeTemplate,
    thumbnail: '🎨'
  },
  {
    id: 'executive',
    name: 'Executive',
    profession: 'Management',
    component: ExecutiveTemplate,
    thumbnail: '👔'
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
  },
  {
    id: 'finance',
    name: 'Finance',
    profession: 'Finance & Accounting',
    component: FinanceTemplate,
    thumbnail: '💰'
  },
  {
    id: 'healthcare',
    name: 'Healthcare',
    profession: 'Healthcare',
    component: HealthcareTemplate,
    thumbnail: '🏥'
  },
  {
    id: 'education',
    name: 'Education',
    profession: 'Education',
    component: EducationTemplate,
    thumbnail: '📚'
  }
];

export default templates;
