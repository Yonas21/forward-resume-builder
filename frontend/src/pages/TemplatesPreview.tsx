import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { templates } from '../components/TemplateConfig';
import type { Resume } from '../types';

const TemplatesPreview: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0].id);
  
  // Sample resume data for preview
  const sampleResume: Resume = {
    personal_info: {
      full_name: 'Alex Johnson',
      email: 'alex.johnson@example.com',
      phone: '(555) 123-4567',
      location: 'New York, NY',
      linkedin: 'linkedin.com/in/alexjohnson',
      github: 'github.com/alexjohnson',
      website: 'alexjohnson.dev'
    },
    professional_summary: 'Experienced professional with 5+ years of expertise in the field. Proven track record of delivering results and driving innovation.',
    skills: ['Project Management', 'Team Leadership', 'Strategic Planning', 'Problem Solving', 'Communication', 'Data Analysis', 'Technical Writing'],
    experience: [
      {
        company: 'Tech Innovations Inc.',
        position: 'Senior Project Manager',
        start_date: 'Jan 2020',
        end_date: 'Present',
        is_current: true,
        description: ['Led cross-functional teams to deliver projects on time and within budget', 'Implemented process improvements resulting in 20% efficiency increase', 'Managed stakeholder relationships and client communications']
      },
      {
        company: 'Global Solutions LLC',
        position: 'Project Coordinator',
        start_date: 'Mar 2018',
        end_date: 'Dec 2019',
        is_current: false,
        description: ['Assisted in planning and execution of multiple concurrent projects', 'Developed project documentation and tracking systems', 'Coordinated with vendors and external partners']
      }
    ],
    education: [
      {
        institution: 'University of Business',
        degree: 'Master of Business Administration',
        field_of_study: 'Project Management',
        start_date: '2016',
        end_date: '2018',
        gpa: '3.8'
      },
      {
        institution: 'State University',
        degree: 'Bachelor of Science',
        field_of_study: 'Business Administration',
        start_date: '2012',
        end_date: '2016',
        gpa: '3.6'
      }
    ],
    projects: [
      {
        name: 'Enterprise Resource Planning Implementation',
        description: 'Led the implementation of a new ERP system across the organization, resulting in streamlined operations and improved data visibility.',
        technologies: ['SAP', 'SQL', 'Process Mapping', 'Change Management']
      },
      {
        name: 'Digital Transformation Initiative',
        description: 'Spearheaded a company-wide digital transformation initiative, modernizing legacy systems and introducing new digital tools.',
        technologies: ['Agile Methodology', 'JIRA', 'Microsoft Power BI', 'Salesforce']
      }
    ],
    certifications: [
      {
        name: 'Project Management Professional (PMP)',
        issuing_organization: 'Project Management Institute',
        issue_date: '2019-05-15',
        expiration_date: '2022-05-15',
        credential_id: 'PMP-123456'
      },
      {
        name: 'Certified Scrum Master (CSM)',
        issuing_organization: 'Scrum Alliance',
        issue_date: '2018-10-10',
        expiration_date: '2020-10-10',
        credential_id: 'CSM-789012'
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6 text-purple-600 text-center">
        Resume Templates Gallery
      </h1>
      <p className="text-lg text-gray-600 mb-8 text-center max-w-3xl mx-auto">
        Browse our collection of professionally designed resume templates. Each template is optimized for ATS systems and tailored for specific professions.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl ${selectedTemplate === template.id ? 'ring-2 ring-purple-500' : ''}`}
            onClick={() => setSelectedTemplate(template.id)}
          >
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">{template.name}</h2>
              <p className="text-gray-600">Ideal for: {template.profession}</p>
            </div>
            
            <div className="p-4 bg-gray-50 h-96 overflow-auto">
              {/* Render the template with sample data */}
              <div className="transform scale-75 origin-top">
                {React.createElement(template.component, {
                  resume: sampleResume,
                  color: '#4f46e5', // Default purple color
                  font: 'font-sans'
                })}
              </div>
            </div>
            
            <div className="p-4 flex justify-between items-center bg-white">
              <span className={`px-3 py-1 rounded-full text-xs ${selectedTemplate === template.id ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                {template.profession}
              </span>
              <Link 
                to="/builder" 
                className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                onClick={() => {
                  localStorage.setItem('selectedTemplate', template.id);
                  localStorage.setItem('selectedProfession', template.profession);
                }}
              >
                Use This Template
              </Link>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center">
        <Link 
          to="/builder" 
          className="bg-blue-600 text-white py-3 px-8 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors inline-block"
        >
          Create Your Resume
        </Link>
      </div>
    </div>
  );
};

export default TemplatesPreview;