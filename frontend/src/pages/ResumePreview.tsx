import React, { useEffect, useState } from 'react';
import type { Resume } from '../types';
import { templates } from '../components/TemplateConfig';
import { FiDownload, FiPrinter, FiFileText, FiMaximize, FiMinimize, FiEdit } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { pdf } from '@react-pdf/renderer';
import ResumePDF from '../components/ResumePDF';
import { useResumeStore } from '../store/resumeStore';

const ResumePreview: React.FC = () => {
  const storeResume = useResumeStore((s) => s.resume);
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
    skills: [
      { name: 'SQL', category: 'databases', level: 'advanced' },
      { name: 'Python', category: 'technical', level: 'expert' },
      { name: 'R', category: 'technical', level: 'advanced' },
      { name: 'Tableau', category: 'tools', level: 'advanced' },
      { name: 'Power BI', category: 'tools', level: 'intermediate' },
      { name: 'Excel', category: 'tools', level: 'expert' },
      { name: 'Statistical Analysis', category: 'technical', level: 'advanced' },
      { name: 'Data Visualization', category: 'technical', level: 'advanced' },
      { name: 'Machine Learning', category: 'technical', level: 'intermediate' },
      { name: 'A/B Testing', category: 'technical', level: 'intermediate' },
      { name: 'Data Cleaning', category: 'technical', level: 'advanced' },
      { name: 'ETL Processes', category: 'technical', level: 'intermediate' }
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

  useEffect(() => {
    const storedFont = localStorage.getItem('resumeFont') || localStorage.getItem('selectedFont');
    const storedColor = localStorage.getItem('resumeColor') || localStorage.getItem('selectedColor');
    const storedTemplate = localStorage.getItem('selectedTemplate');

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

  const handleExportPDF = async () => {
    try {
      const resumeToExport = resumeToDisplay;
          const pdfDoc = <ResumePDF resume={resumeToExport} sectionOrder={sectionOrder} color={color} font={font as any} />;
      const blob = await pdf(pdfDoc).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${resumeToExport.personal_info?.full_name?.replace(/\s+/g, '_') || 'resume'}_resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  const handleExportJson = () => {
    if (!resumeToDisplay) return;

    const dataStr = JSON.stringify(resumeToDisplay, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `${resumeToDisplay?.personal_info?.full_name?.replace(/\s+/g, '_')}_resume.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Decide whether to use sample or store data
  const isResumeEmpty = (r: Resume | null | undefined) => {
    if (!r) return true;
    const hasName = Boolean(r.personal_info?.full_name?.trim());
    const hasSummary = Boolean(r.professional_summary?.trim());
    const hasAnyList = (r.skills?.length || 0) > 0 || (r.experience?.length || 0) > 0 || (r.education?.length || 0) > 0 || (r.projects?.length || 0) > 0 || (r.certifications?.length || 0) > 0;
    return !(hasName || hasSummary || hasAnyList);
  };

  const resumeToDisplay = isResumeEmpty(storeResume) ? sampleResume : storeResume;
  
  // Show a banner if using sample data
  const isUsingSampleData = isResumeEmpty(storeResume);

  // Get section order from localStorage or use default
  const [sectionOrder] = useState(() => {
    const stored = localStorage.getItem('sectionOrder');
    return stored ? JSON.parse(stored) : ['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications'];
  });

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
          onClick={handleExportPDF}
          className="flex items-center bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
        >
          <FiDownload className="mr-2" /> Export as PDF
        </button>
        <button
          onClick={handlePrint}
          className="flex items-center bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
        >
          <FiPrinter className="mr-2" /> Print
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
          <h3 className="font-bold text-lg mb-2">Export Options:</h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-semibold text-red-700">Export as PDF (Recommended)</h4>
              <p className="text-sm text-gray-700">Click "Export as PDF" to download a professional PDF version of your resume. This creates a clean, formatted document perfect for job applications.</p>
            </div>
            <div>
              <h4 className="font-semibold text-blue-700">Print</h4>
              <p className="text-sm text-gray-700">Use the browser's print function to print or save as PDF through the print dialog.</p>
            </div>
            <div>
              <h4 className="font-semibold text-green-700">Export as JSON</h4>
              <p className="text-sm text-gray-700">Download your resume data as a JSON file for backup or to import into other systems.</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-blue-600">Tip: The "Export as PDF" option creates the most professional-looking document for job applications.</p>
        </div>
      )}

      <div className={`${!isFullScreen ? 'p-0' : 'p-4 mx-auto'} print:p-0 print:max-w-none`}>
        <div className="relative flex justify-center">
          <div
            className={`bg-white shadow-lg ${!isFullScreen ? 'rounded-lg origin-top transform scale-95 lg:scale-90' : ''} print:shadow-none`}
            style={{ width: '816px', minHeight: '1056px' }}
          >
            <div className={`p-8 ${font}`}>
              <SelectedTemplate resume={resumeToDisplay} color={color} font={font} sectionOrder={sectionOrder} />
            </div>
          </div>
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
