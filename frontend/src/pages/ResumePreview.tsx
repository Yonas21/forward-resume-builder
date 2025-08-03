import React, { useEffect, useState } from 'react';
import { Resume } from '../types';

const ResumePreview: React.FC = () => {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);

  useEffect(() => {
    const storedResume = localStorage.getItem('currentResume');
    if (storedResume) {
      setCurrentResume(JSON.parse(storedResume));
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (!currentResume) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl text-gray-600">No resume to preview</h2>
        <p className="text-gray-500 mt-2">Please create or upload a resume first.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6 no-print">
        <button
          onClick={handlePrint}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          Print / Download PDF
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-0">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentResume.personal_info.full_name || '[Your Name]'}
          </h1>
          <div className="text-gray-600 space-y-1">
            {currentResume.personal_info.email && (
              <div>{currentResume.personal_info.email}</div>
            )}
            {currentResume.personal_info.phone && (
              <div>{currentResume.personal_info.phone}</div>
            )}
            {currentResume.personal_info.location && (
              <div>{currentResume.personal_info.location}</div>
            )}
            <div className="flex justify-center space-x-4 text-sm">
              {currentResume.personal_info.linkedin && (
                <span>LinkedIn: {currentResume.personal_info.linkedin}</span>
              )}
              {currentResume.personal_info.github && (
                <span>GitHub: {currentResume.personal_info.github}</span>
              )}
              {currentResume.personal_info.website && (
                <span>Website: {currentResume.personal_info.website}</span>
              )}
            </div>
          </div>
        </div>

        {/* Professional Summary */}
        {currentResume.professional_summary && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Professional Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {currentResume.professional_summary}
            </p>
          </div>
        )}

        {/* Skills */}
        {currentResume.skills.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {currentResume.skills.map((skill, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {currentResume.experience.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Experience
            </h2>
            {currentResume.experience.map((exp, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{exp.position}</h3>
                    <p className="text-gray-700">{exp.company}</p>
                  </div>
                  <div className="text-sm text-gray-600">
                    {exp.start_date} - {exp.is_current ? 'Present' : exp.end_date}
                  </div>
                </div>
                {exp.description.length > 0 && (
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    {exp.description.map((desc, descIndex) => (
                      <li key={descIndex}>{desc}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {currentResume.education.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Education
            </h2>
            {currentResume.education.map((edu, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-700">{edu.institution}</p>
                    {edu.field_of_study && (
                      <p className="text-sm text-gray-600">{edu.field_of_study}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {edu.start_date} - {edu.end_date}
                    {edu.gpa && <div>GPA: {edu.gpa}</div>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Projects */}
        {currentResume.projects.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Projects
            </h2>
            {currentResume.projects.map((project, index) => (
              <div key={index} className="mb-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  {project.url && (
                    <a href={project.url} className="text-blue-600 hover:underline text-sm">
                      View Project
                    </a>
                  )}
                </div>
                <p className="text-gray-700 mb-2">{project.description}</p>
                {project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs"
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

        {/* Certifications */}
        {currentResume.certifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 border-b-2 border-gray-200 pb-1">
              Certifications
            </h2>
            {currentResume.certifications.map((cert, index) => (
              <div key={index} className="mb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                    <p className="text-gray-700">{cert.issuing_organization}</p>
                    {cert.credential_id && (
                      <p className="text-sm text-gray-600">ID: {cert.credential_id}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-600">
                    {cert.issue_date}
                    {cert.expiration_date && (
                      <div>Expires: {cert.expiration_date}</div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumePreview;

