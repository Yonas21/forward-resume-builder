import React, { useEffect, useState } from 'react';
import type { Resume } from '../types';
import { templates } from '../components/TemplateConfig';
import { FiDownload, FiPrinter, FiFileText, FiMaximize, FiMinimize, FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const ResumePreview: React.FC = () => {
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState('data-analyst');
  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#333');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showPrintGuide, setShowPrintGuide] = useState(false);
  
  // Sample resume data for preview when no resume is available - Data Analyst template
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
    skills: ['SQL', 'Python', 'R', 'Tableau', 'Power BI', 'Excel', 'Statistical Analysis', 'Data Visualization', 'Machine Learning', 'A/B Testing', 'Data Cleaning', 'ETL Processes'],
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

  useEffect(() => {
    const storedResume = localStorage.getItem('currentResume');
    const storedFont = localStorage.getItem('selectedFont');
    const storedColor = localStorage.getItem('selectedColor');
    const storedTemplate = localStorage.getItem('selectedTemplate');

    if (storedResume) {
      setCurrentResume(JSON.parse(storedResume));
    }

    if (storedFont) {
      setFont(storedFont);
    }

    if (storedColor) {
      setColor(storedColor);
    }

    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleExportJson = () => {
    if (!currentResume) return;

    const dataStr = JSON.stringify(currentResume, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${currentResume?.personal_info?.full_name?.replace(/\s+/g, '_')}_resume.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Use sample resume if no resume is available
  const resumeToDisplay = currentResume || sampleResume;
  
  // Show a banner if using sample data
  const isUsingSampleData = !currentResume;

  // Find the selected template component
  const SelectedTemplate = templates.find(t => t.id === selectedTemplate)?.component || templates[0].component;

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const togglePrintGuide = () => {
    setShowPrintGuide(!showPrintGuide);
  };

  return (
    <div className={`transition-all duration-300 ${isFullScreen ? 'fixed inset-0 z-50 bg-white overflow-auto' : 'max-w-4xl mx-auto py-8 px-4'}`}>
      {isUsingSampleData && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg no-print">
          <h3 className="font-bold text-lg mb-2 text-blue-700">Data Analyst Resume Template</h3>
          <p className="text-blue-700 mb-3">This is a sample Data Analyst resume template. Replace "Your Name" with your information to create your own professional resume.</p>
          <Link 
            to="/builder" 
            className="inline-flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            <FiEdit className="mr-2" /> Customize This Resume
          </Link>
        </div>
      )}
      
      <div className="mb-6 no-print flex flex-wrap gap-3 sticky top-0 bg-white z-10 p-2 border-b border-gray-200">
        <button
          onClick={handlePrint}
          className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          <FiPrinter className="mr-2" /> Print / Download PDF
        </button>
        <button
          onClick={handleExportJson}
          className="flex items-center bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600"
        >
          <FiFileText className="mr-2" /> Export as JSON
        </button>
        <button
          onClick={toggleFullScreen}
          className="flex items-center bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600"
        >
          {isFullScreen ? <FiMinimize className="mr-2" /> : <FiMaximize className="mr-2" />}
          {isFullScreen ? 'Exit Full Screen' : 'Full Screen Preview'}
        </button>
        <button
          onClick={togglePrintGuide}
          className="flex items-center bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
        >
          <FiDownload className="mr-2" /> {showPrintGuide ? 'Hide Print Guide' : 'Show Print Guide'}
        </button>
      </div>

      {showPrintGuide && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200 no-print">
          <h3 className="font-bold text-lg mb-2">How to save your resume as PDF:</h3>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Click the "Print / Download PDF" button above</li>
            <li>In the print dialog, change the destination to "Save as PDF"</li>
            <li>Click "Save" and choose where to save your file</li>
            <li>Your resume is now saved as a professional PDF ready to share!</li>
          </ol>
          <p className="mt-3 text-sm text-blue-600">Tip: Make sure all content fits properly before saving. Use Full Screen Preview to check how it will look.</p>
        </div>
      )}

      <div className={`bg-white ${!isFullScreen ? 'shadow-lg rounded-lg p-8' : 'p-4 mx-auto max-w-4xl'} print:shadow-none print:p-0 print:max-w-none`}>
        <div className="relative">
          <SelectedTemplate resume={resumeToDisplay} color={color} font={font} />
          {isFullScreen && (
            <button 
              onClick={toggleFullScreen}
              className="fixed bottom-4 right-4 bg-gray-800 text-white p-2 rounded-full shadow-lg no-print"
            >
              <FiMinimize />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
