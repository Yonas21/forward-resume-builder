import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { templates } from '../components/TemplateConfig';
import type { Resume } from '../types';

const TemplatesPreview: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[3].id);
  
  // Sample resume data for preview - Data Analyst template
  const sampleResume: Resume = {
    personal_info: {
      full_name: 'Your Name',
      email: 'yourname@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/yourname',
      github: 'github.com/yourname',
      website: 'yourportfolio.dev'
    },
    professional_summary: 'Detail-oriented Data Analyst with 4+ years of experience transforming complex datasets into actionable insights. Proficient in statistical analysis, data visualization, and communicating findings to technical and non-technical stakeholders.',
    skills: [
      { name: 'SQL', category: 'language', level: 'expert' },
      { name: 'Python', category: 'language', level: 'expert' },
      { name: 'R', category: 'language', level: 'advanced' },
      { name: 'Tableau', category: 'tools', level: 'expert' },
      { name: 'Power BI', category: 'tools', level: 'advanced' },
      { name: 'Excel', category: 'tools', level: 'expert' },
      { name: 'Statistical Analysis', category: 'technical', level: 'expert' },
      { name: 'Data Visualization', category: 'technical', level: 'expert' },
      { name: 'Machine Learning', category: 'technical', level: 'advanced' },
      { name: 'A/B Testing', category: 'technical', level: 'advanced' },
      { name: 'Data Cleaning', category: 'technical', level: 'expert' },
      { name: 'ETL Processes', category: 'technical', level: 'intermediate' },
    ],
    experience: [
      {
        company: 'Data Insights Corp',
        position: 'Senior Data Analyst',
        start_date: 'Jun 2021',
        end_date: 'Present',
        is_current: true,
        description: ['Analyzed customer behavior data to identify patterns, resulting in 15% increase in user retention', 'Built interactive dashboards using Tableau to visualize KPIs for executive leadership', 'Implemented A/B testing framework that improved conversion rates by 22%', 'Collaborated with cross-functional teams to develop data-driven solutions']
      },
      {
        company: 'Tech Analytics LLC',
        position: 'Data Analyst',
        start_date: 'Mar 2019',
        end_date: 'May 2021',
        is_current: false,
        description: ['Performed data cleaning and preprocessing on large datasets using Python and SQL', 'Created automated reporting systems that saved 10 hours of manual work weekly', 'Conducted statistical analysis to identify market trends and opportunities', 'Presented findings to stakeholders in clear, actionable reports']
      }
    ],
    education: [
      {
        institution: 'University of Data Science',
        degree: 'Master of Science',
        field_of_study: 'Data Analytics',
        start_date: '2017',
        end_date: '2019',
        gpa: '3.9'
      },
      {
        institution: 'State University',
        degree: 'Bachelor of Science',
        field_of_study: 'Statistics',
        start_date: '2013',
        end_date: '2017',
        gpa: '3.7'
      }
    ],
    projects: [
      {
        name: 'Customer Segmentation Analysis',
        description: 'Applied clustering algorithms to segment customers based on purchasing behavior, enabling targeted marketing campaigns that increased revenue by 18%.',
        technologies: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib', 'K-means Clustering']
      },
      {
        name: 'Sales Prediction Model',
        description: 'Developed a machine learning model to forecast quarterly sales with 92% accuracy, helping the company optimize inventory management and resource allocation.',
        technologies: ['R', 'Random Forest', 'Time Series Analysis', 'Data Visualization', 'Feature Engineering']
      }
    ],
    certifications: [
      {
        name: 'Microsoft Certified: Data Analyst Associate',
        issuing_organization: 'Microsoft',
        issue_date: '2022-03-15',
        expiration_date: '2025-03-15',
        credential_id: 'DA-123456'
      },
      {
        name: 'Google Data Analytics Professional Certificate',
        issuing_organization: 'Google',
        issue_date: '2021-06-10',
        expiration_date: '',
        credential_id: 'GDA-789012'
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
                  color: '#4f46e5',
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
