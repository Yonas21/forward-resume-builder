import React from 'react';
import type { Resume } from '../types';

export interface TemplateProps {
  resume: Resume;
  color: string;
  font: string;
}

export interface TemplateOption {
  id: string;
  name: string;
  profession: string;
  component: React.FC<TemplateProps>;
  thumbnail: string;
}

// Basic Template - Good for most professions
const BasicTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header */}
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

      {/* Summary */}
      {resume.professional_summary && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-1 border-b`} style={{ color }}>
            Professional Summary
          </h2>
          <p>{resume.professional_summary}</p>
        </div>
      )}

      {/* Skills */}
      {resume?.skills?.length > 0 && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-1 border-b`} style={{ color }}>
            Skills
          </h2>
          <div className="flex flex-wrap gap-1">
            {resume.skills.map((skill, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {resume?.experience?.length > 0 && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Experience
          </h2>
          {resume.experience.map((exp, index) => (
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
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
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
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <div className="mb-4">
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Projects
          </h2>
          {resume.projects.map((project, index) => (
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
      )}

      {/* Certifications */}
      {resume?.certifications?.length > 0 && (
        <div>
          <h2 className={`text-lg font-semibold mb-2 border-b`} style={{ color }}>
            Certifications
          </h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-medium">{cert.name}</h3>
              <p className="text-sm">
                {cert.issuing_organization}
                {cert.issue_date &&
                  ` - ${new Date(cert.issue_date).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Modern Template - Good for tech and creative roles
const ModernTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} grid grid-cols-3 gap-6 text-sm`}>
      {/* Sidebar */}
      <div className="col-span-1" style={{ backgroundColor: `${color}15` }}>
        <div className="p-4">
          {/* Profile */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold mb-1" style={{ color }}>
              {resume.personal_info.full_name || '[Your Name]'}
            </h1>
          </div>

          {/* Contact */}
          <div className="mb-6">
            <h2 className="text-md font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
              Contact
            </h2>
            <ul className="space-y-1">
              {resume.personal_info.email && (
                <li className="flex items-center">
                  <span className="mr-2">📧</span>
                  <span>{resume.personal_info.email}</span>
                </li>
              )}
              {resume.personal_info.phone && (
                <li className="flex items-center">
                  <span className="mr-2">📱</span>
                  <span>{resume.personal_info.phone}</span>
                </li>
              )}
              {resume.personal_info.location && (
                <li className="flex items-center">
                  <span className="mr-2">📍</span>
                  <span>{resume.personal_info.location}</span>
                </li>
              )}
              {resume.personal_info.linkedin && (
                <li className="flex items-center">
                  <span className="mr-2">🔗</span>
                  <span>{resume.personal_info.linkedin}</span>
                </li>
              )}
              {resume.personal_info.github && (
                <li className="flex items-center">
                  <span className="mr-2">💻</span>
                  <span>{resume.personal_info.github}</span>
                </li>
              )}
            </ul>
          </div>

          {/* Skills */}
          {resume.skills.length > 0 && (
            <div className="mb-6">
              <h2 className="text-md font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
                Skills
              </h2>
              <div className="flex flex-wrap gap-1">
                {resume.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 rounded-full text-xs mb-1"
                    style={{ backgroundColor: `${color}30`, color: `${color}` }}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resume.education.length > 0 && (
            <div>
              <h2 className="text-md font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
                Education
              </h2>
              {resume.education.map((edu, index) => (
                <div key={index} className="mb-3">
                  <h3 className="font-medium text-sm">{edu.institution}</h3>
                  <p className="text-xs">
                    {edu.degree}
                    {edu.field_of_study && `, ${edu.field_of_study}`}
                  </p>
                  <p className="text-xs text-gray-600">
                    {edu.start_date && new Date(edu.start_date).getFullYear()}{' '}
                    {edu.end_date && `- ${new Date(edu.end_date).getFullYear()}`}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="col-span-2 p-4">
        {/* Summary */}
        {resume.professional_summary && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2" style={{ color }}>
              Professional Summary
            </h2>
            <p>{resume.professional_summary}</p>
          </div>
        )}

        {/* Experience */}
        {resume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color }}>
              Experience
            </h2>
            {resume.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">{exp.position}</h3>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {exp.start_date && new Date(exp.start_date).getFullYear()}{' '}
                    {exp.end_date
                      ? `- ${new Date(exp.end_date).getFullYear()}`
                      : exp.is_current
                      ? '- Present'
                      : ''}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-1">{exp.company}</p>
                <ul className="list-disc pl-5 text-sm">
                  {exp.description.map((desc, i) => (
                    <li key={i}>{desc}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {resume.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3" style={{ color }}>
              Projects
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {resume.projects.map((project, index) => (
                <div key={index} className="border rounded-lg p-3" style={{ borderColor: `${color}30` }}>
                  <h3 className="font-medium">
                    {project.name}
                    {project.url && (
                      <a
                        href={project.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 ml-2 text-xs"
                      >
                        [View Project]
                      </a>
                    )}
                  </h3>
                  <p className="text-sm mt-1">{project.description}</p>
                  {project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.technologies.map((tech, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-0.5 rounded"
                          style={{ backgroundColor: `${color}15`, color: `${color}` }}
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {resume.certifications.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3" style={{ color }}>
              Certifications
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {resume.certifications.map((cert, index) => (
                <div key={index} className="border p-2 rounded" style={{ borderColor: `${color}30` }}>
                  <h3 className="font-medium text-sm">{cert.name}</h3>
                  <p className="text-xs text-gray-600">
                    {cert.issuing_organization}
                    {cert.issue_date &&
                      ` - ${new Date(cert.issue_date).toLocaleDateString()}`}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Professional Template - Good for business, finance, legal
const ProfessionalTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-center mb-2" style={{ color }}>
          {resume.personal_info.full_name || '[Your Name]'}
        </h1>
        <div className="flex justify-center flex-wrap gap-x-4 text-gray-600 text-sm">
          {resume.personal_info.email && <span>{resume.personal_info.email}</span>}
          {resume.personal_info.phone && <span>|</span>}
          {resume.personal_info.phone && <span>{resume.personal_info.phone}</span>}
          {resume.personal_info.location && <span>|</span>}
          {resume.personal_info.location && <span>{resume.personal_info.location}</span>}
          {resume.personal_info.linkedin && <span>|</span>}
          {resume.personal_info.linkedin && <span>{resume.personal_info.linkedin}</span>}
        </div>
      </div>

      <hr className="border-t-2 mb-4" style={{ borderColor: color }} />

      {/* Summary */}
      {resume.professional_summary && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider" style={{ color }}>
            Professional Summary
          </h2>
          <p className="text-justify">{resume.professional_summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3 uppercase tracking-wider" style={{ color }}>
            Professional Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.company}</h3>
                <span className="text-gray-600 text-sm">
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}{' '}
                  {exp.end_date
                    ? `- ${new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                    : exp.is_current
                    ? '- Present'
                    : ''}
                </span>
              </div>
              <p className="font-medium italic mb-1">{exp.position}</p>
              <ul className="list-disc pl-5">
                {exp.description.map((desc, i) => (
                  <li key={i} className="text-justify">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3 uppercase tracking-wider" style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between">
                <h3 className="font-semibold">{edu.institution}</h3>
                <span className="text-gray-600 text-sm">
                  {edu.start_date && new Date(edu.start_date).getFullYear()}{' '}
                  {edu.end_date && `- ${new Date(edu.end_date).getFullYear()}`}
                </span>
              </div>
              <p>
                <span className="font-medium">{edu.degree}</span>
                {edu.field_of_study && `, ${edu.field_of_study}`}
                {edu.gpa && <span className="italic"> - GPA: {edu.gpa}</span>}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider" style={{ color }}>
            Skills
          </h2>
          <div className="flex flex-wrap">
            {resume.skills.map((skill, index) => (
              <span key={index} className="mr-2 mb-2">
                • {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider" style={{ color }}>
            Certifications
          </h2>
          {resume.certifications.map((cert, index) => (
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
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 uppercase tracking-wider" style={{ color }}>
            Projects
          </h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-3">
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
              <p className="text-justify">{project.description}</p>
              {project.technologies.length > 0 && (
                <p className="text-gray-600 italic mt-1">
                  Technologies: {project.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Technical Template - Good for software developers, engineers, IT
const TechnicalTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color }}>
          {resume.personal_info.full_name || '[Your Name]'}
        </h1>
        <div className="flex flex-wrap gap-x-3 text-gray-600 text-sm">
          {resume.personal_info.email && (
            <span className="flex items-center">
              <span className="mr-1">📧</span>
              {resume.personal_info.email}
            </span>
          )}
          {resume.personal_info.phone && (
            <span className="flex items-center">
              <span className="mr-1">📱</span>
              {resume.personal_info.phone}
            </span>
          )}
          {resume.personal_info.location && (
            <span className="flex items-center">
              <span className="mr-1">📍</span>
              {resume.personal_info.location}
            </span>
          )}
          {resume.personal_info.github && (
            <span className="flex items-center">
              <span className="mr-1">💻</span>
              {resume.personal_info.github}
            </span>
          )}
          {resume.personal_info.linkedin && (
            <span className="flex items-center">
              <span className="mr-1">🔗</span>
              {resume.personal_info.linkedin}
            </span>
          )}
        </div>
      </div>

      {/* Technical Skills */}
      {resume.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 border-b-2" style={{ color, borderColor: color }}>
            Technical Skills
          </h2>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {resume.skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                <span className="mr-2 text-xs" style={{ color }}>▶</span>
                <span>{skill}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Professional Summary */}
      {resume.professional_summary && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 border-b-2" style={{ color, borderColor: color }}>
            Professional Summary
          </h2>
          <p>{resume.professional_summary}</p>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3 border-b-2" style={{ color, borderColor: color }}>
            Professional Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.position}</h3>
                <span className="text-gray-600 text-sm">
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}{' '}
                  {exp.end_date
                    ? `- ${new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                    : exp.is_current
                    ? '- Present'
                    : ''}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{exp.company}</p>
              <ul className="list-disc pl-5">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3 border-b-2" style={{ color, borderColor: color }}>
            Technical Projects
          </h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{project.name}</h3>
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                    style={{ color }}
                  >
                    [GitHub]
                  </a>
                )}
              </div>
              <p>{project.description}</p>
              {project.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.technologies.map((tech, i) => (
                    <span
                      key={i}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2 border-b-2" style={{ color, borderColor: color }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
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
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2 border-b-2" style={{ color, borderColor: color }}>
            Certifications
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {resume.certifications.map((cert, index) => (
              <div key={index} className="mb-2">
                <h3 className="font-medium">{cert.name}</h3>
                <p className="text-gray-600 text-sm">
                  {cert.issuing_organization}
                  {cert.issue_date &&
                    ` - ${new Date(cert.issue_date).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Data Analyst Template
const DataAnalystTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color }}>
          {resume.personal_info.full_name || '[Your Name]'}
        </h1>
        <h2 className="text-lg text-gray-600 mb-2">Data Analyst</h2>
        <div className="flex flex-wrap gap-x-4 text-gray-600">
          {resume.personal_info.email && <span>{resume.personal_info.email}</span>}
          {resume.personal_info.phone && <span>{resume.personal_info.phone}</span>}
          {resume.personal_info.location && <span>{resume.personal_info.location}</span>}
          {resume.personal_info.linkedin && <span>{resume.personal_info.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {resume.professional_summary && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2" style={{ color }}>
            Professional Summary
          </h2>
          <p>{resume.professional_summary}</p>
        </div>
      )}

      {/* Skills - Categorized for data analysts */}
      {resume.skills.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2" style={{ color }}>
            Technical Skills
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-1">Data Analysis Tools</h3>
              <ul className="list-disc pl-5">
                {resume.skills
                  .filter(skill => 
                    ['SQL', 'Python', 'R', 'Excel', 'Tableau', 'Power BI', 'SPSS', 'SAS', 'Stata', 'MATLAB']
                      .some(tool => skill.toLowerCase().includes(tool.toLowerCase()))
                  )
                  .map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))
                }
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-1">Other Skills</h3>
              <ul className="list-disc pl-5">
                {resume.skills
                  .filter(skill => 
                    !['SQL', 'Python', 'R', 'Excel', 'Tableau', 'Power BI', 'SPSS', 'SAS', 'Stata', 'MATLAB']
                      .some(tool => skill.toLowerCase().includes(tool.toLowerCase()))
                  )
                  .map((skill, index) => (
                    <li key={index}>{skill}</li>
                  ))
                }
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Experience */}
      {resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3" style={{ color }}>
            Professional Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-baseline">
                <h3 className="font-semibold">{exp.position}</h3>
                <span className="text-gray-600">
                  {exp.start_date && new Date(exp.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}{' '}
                  {exp.end_date
                    ? `- ${new Date(exp.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' })}`
                    : exp.is_current
                    ? '- Present'
                    : ''}
                </span>
              </div>
              <p className="text-gray-700 mb-1">{exp.company}</p>
              <ul className="list-disc pl-5">
                {exp.description.map((desc, i) => (
                  <li key={i}>{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Projects - Highlighting data analysis projects */}
      {resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-3" style={{ color }}>
            Data Analysis Projects
          </h2>
          {resume.projects.map((project, index) => (
            <div key={index} className="mb-3">
              <h3 className="font-medium">
                {project.name}
                {project.url && (
                  <a
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 ml-2 text-sm"
                  >
                    [View Project]
                  </a>
                )}
              </h3>
              <p>{project.description}</p>
              {project.technologies.length > 0 && (
                <p className="text-gray-600 italic mt-1">
                  Tools & Technologies: {project.technologies.join(', ')}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className="text-lg font-semibold mb-2" style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
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
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-2" style={{ color }}>
            Certifications
          </h2>
          {resume.certifications.map((cert, index) => (
            <div key={index} className="mb-2">
              <h3 className="font-medium">{cert.name}</h3>
              <p className="text-gray-600">
                {cert.issuing_organization}
                {cert.issue_date &&
                  ` - ${new Date(cert.issue_date).toLocaleDateString()}`}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Export all templates
// Data Engineer Template - Specialized for data engineering roles
const DataEngineerTemplate: React.FC<TemplateProps> = ({ resume, color, font }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header with technical styling */}
      <div className="mb-6 border-b-2 pb-4" style={{ borderColor: color }}>
        <h1 className={`text-2xl font-bold mb-1`} style={{ color }}>
          {resume.personal_info.full_name || '[Your Name]'}
        </h1>
        <div className="flex flex-wrap gap-x-4 text-gray-600">
          {resume.personal_info.email && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              {resume.personal_info.email}
            </span>
          )}
          {resume.personal_info.phone && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              {resume.personal_info.phone}
            </span>
          )}
          {resume.personal_info.location && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              {resume.personal_info.location}
            </span>
          )}
          {resume.personal_info.linkedin && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.338 16.338H13.67V12.16c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.08-1.6 2.2v4.26H8.014v-8.6h2.558v1.18h.036c.356-.67 1.227-1.38 2.526-1.38 2.7 0 3.204 1.78 3.204 4.1v4.7zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.6H3.667v8.6z" clipRule="evenodd" />
              </svg>
              {resume.personal_info.linkedin}
            </span>
          )}
          {resume.personal_info.github && (
            <span className="flex items-center">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V19c0 .27.16.59.67.5C17.14 18.16 20 14.42 20 10A10 10 0 0010 0z" clipRule="evenodd" />
              </svg>
              {resume.personal_info.github}
            </span>
          )}
        </div>
      </div>

      {/* Technical Skills Section - Highlighted for data engineering */}
      {resume.skills.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-lg font-semibold mb-2`} style={{ color }}>
            Technical Skills
          </h2>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <h3 className="font-medium mb-1">Data Technologies</h3>
              <div className="flex flex-wrap gap-1">
                {resume.skills
                  .filter(skill => 
                    ['SQL', 'Hadoop', 'Spark', 'Kafka', 'ETL', 'Airflow', 'Python', 'Scala', 'Java', 'Big Data', 'Data Modeling', 'Data Warehouse', 'Data Lake', 'Snowflake', 'Redshift', 'BigQuery', 'Databricks'].some(tech => 
                      skill.toLowerCase().includes(tech.toLowerCase())
                    )
                  )
                  .map((skill, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm border-l-2" style={{ borderColor: color }}>
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium mb-1">Other Skills</h3>
              <div className="flex flex-wrap gap-1">
                {resume.skills
                  .filter(skill => 
                    !['SQL', 'Hadoop', 'Spark', 'Kafka', 'ETL', 'Airflow', 'Python', 'Scala', 'Java', 'Big Data', 'Data Modeling', 'Data Warehouse', 'Data Lake', 'Snowflake', 'Redshift', 'BigQuery', 'Databricks'].some(tech => 
                      skill.toLowerCase().includes(tech.toLowerCase())
                    )
                  )
                  .map((skill, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary - Emphasizing data engineering expertise */}
      {resume.professional_summary && (
        <div className="mb-5">
          <h2 className={`text-lg font-semibold mb-1`} style={{ color }}>
            Professional Summary
          </h2>
          <p className="text-justify">{resume.professional_summary}</p>
        </div>
      )}

      {/* Experience - With technical highlights */}
      {resume.experience.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-lg font-semibold mb-2`} style={{ color }}>
            Experience
          </h2>
          {resume.experience.map((exp, index) => (
            <div key={index} className="mb-4">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-base">{exp.position}</h3>
                <span className="text-gray-600 text-sm">
                  {exp.start_date && new Date(exp.start_date).getFullYear()}{' '}
                  {exp.end_date
                    ? `- ${new Date(exp.end_date).getFullYear()}`
                    : exp.is_current
                    ? '- Present'
                    : ''}
                </span>
              </div>
              <p className="text-gray-700 italic">{exp.company}</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {exp.description.map((desc, i) => (
                  <li key={i} className="text-sm">{desc}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {resume.education.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-lg font-semibold mb-2`} style={{ color }}>
            Education
          </h2>
          {resume.education.map((edu, index) => (
            <div key={index} className="mb-2">
              <div className="flex justify-between">
                <h3 className="font-medium">{edu.institution}</h3>
                <span className="text-gray-600 text-sm">
                  {edu.start_date && new Date(edu.start_date).getFullYear()}{' '}
                  {edu.end_date && `- ${new Date(edu.end_date).getFullYear()}`}
                </span>
              </div>
              <p>
                {edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}
                {edu.gpa && ` - GPA: ${edu.gpa}`}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Projects - Highlighting data engineering projects */}
      {resume.projects.length > 0 && (
        <div className="mb-5">
          <h2 className={`text-lg font-semibold mb-2`} style={{ color }}>
            Projects
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {resume.projects.map((project, index) => (
              <div key={index} className="border-l-2 pl-3" style={{ borderColor: color }}>
                <h3 className="font-medium">{project.name}</h3>
                <p className="text-sm">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {project.technologies.map((tech, i) => (
                      <span key={i} className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}
                {project.url && (
                  <a 
                    href={project.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs mt-1 inline-block hover:underline"
                    style={{ color }}
                  >
                    View Project
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {resume.certifications.length > 0 && (
        <div>
          <h2 className={`text-lg font-semibold mb-2`} style={{ color }}>
            Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {resume.certifications.map((cert, index) => (
              <div key={index} className="text-sm">
                <h3 className="font-medium">{cert.name}</h3>
                <p className="text-gray-600">{cert.issuing_organization}</p>
                <p className="text-gray-500">
                  {cert.issue_date && new Date(cert.issue_date).getFullYear()}
                  {cert.expiration_date && ` - ${new Date(cert.expiration_date).getFullYear()}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Marketing Professional Template
const MarketingTemplate: React.FC<TemplateProps> = ({ resume, font, color }) => {
  return (
    <div className={`${font} text-sm`}>
      {/* Header with creative styling */}
      <header className="mb-6">
        <h1 className="text-3xl font-bold mb-1" style={{ color }}>
          {resume.personal_info.full_name}
        </h1>
        <p className="text-lg italic mb-2">
          Marketing Professional
        </p>
        <div className="flex flex-wrap gap-3 text-sm">
          {resume.personal_info.email && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {resume.personal_info.email}
            </span>
          )}
          {resume.personal_info.phone && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {resume.personal_info.phone}
            </span>
          )}
          {resume.personal_info.location && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {resume.personal_info.location}
            </span>
          )}
          {resume.personal_info.linkedin && (
            <span className="flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
              </svg>
              {resume.personal_info.linkedin}
            </span>
          )}
        </div>
      </header>

      {/* Brand Statement / Professional Summary with creative styling */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
          Brand Statement
        </h2>
        <p className="text-sm leading-relaxed">
          {resume.professional_summary}
        </p>
      </section>

      {/* Marketing Skills with categorization */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
          Marketing Expertise
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-md font-medium mb-1" style={{ color }}>
              Digital Marketing
            </h3>
            <ul className="list-disc list-inside text-sm">
              {resume.skills
                .filter(skill => [
                  'seo', 'sem', 'ppc', 'google ads', 'facebook ads', 'social media', 
                  'content marketing', 'email marketing', 'analytics'
                ].some(term => skill.toLowerCase().includes(term)))
                .map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="text-md font-medium mb-1" style={{ color }}>
              Creative & Strategy
            </h3>
            <ul className="list-disc list-inside text-sm">
              {resume.skills
                .filter(skill => [
                  'brand', 'campaign', 'creative', 'copywriting', 'design', 
                  'strategy', 'market research', 'presentation'
                ].some(term => skill.toLowerCase().includes(term)))
                .map((skill, index) => (
                  <li key={index}>{skill}</li>
                ))}
            </ul>
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-md font-medium mb-1" style={{ color }}>
            Tools & Platforms
          </h3>
          <p className="text-sm">
            {resume.skills
              .filter(skill => [
                'adobe', 'canva', 'hubspot', 'mailchimp', 'google analytics', 
                'hootsuite', 'wordpress', 'shopify', 'salesforce'
              ].some(term => skill.toLowerCase().includes(term)))
              .join(' • ')}
          </p>
        </div>
      </section>

      {/* Marketing Experience with campaign highlights */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
          Marketing Experience
        </h2>
        {resume.experience.map((exp, index) => (
          <div key={index} className="mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-md font-medium" style={{ color }}>
                  {exp.position}
                </h3>
                <h4 className="text-sm font-medium">{exp.company}</h4>
              </div>
              <div className="text-sm text-gray-600">
                {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
              </div>
            </div>
            <ul className="list-disc list-inside text-sm mt-1">
              {exp.description.map((desc, i) => (
                <li key={i}>{desc}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      {/* Campaign Portfolio / Projects */}
      {resume.projects && resume.projects.length > 0 && (
        <section className="mb-6">
          <h2 className="text-xl font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
            Campaign Portfolio
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {resume.projects.map((project, index) => (
              <div key={index} className="text-sm">
                <h3 className="font-medium" style={{ color }}>
                  {project.name}
                </h3>
                <p className="text-sm">{project.description}</p>
                {project.technologies && project.technologies.length > 0 && (
                  <p className="text-xs mt-1">
                    <span className="font-medium">Tools & Channels:</span> {project.technologies.join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      <section>
        <h2 className="text-xl font-semibold mb-2 pb-1 border-b-2" style={{ borderColor: color }}>
          Education
        </h2>
        {resume.education.map((edu, index) => (
          <div key={index} className="mb-2">
            <div className="flex justify-between">
              <h3 className="text-md font-medium" style={{ color }}>
                {edu.degree}{edu.field_of_study ? `, ${edu.field_of_study}` : ''}
              </h3>
              <span className="text-sm text-gray-600">
                {edu.start_date} - {edu.end_date}
              </span>
            </div>
            <p className="text-sm">{edu.institution}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

// Export all template components for use in TemplateConfig
export {
  BasicTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  TechnicalTemplate,
  DataAnalystTemplate,
  DataEngineerTemplate,
  MarketingTemplate
};