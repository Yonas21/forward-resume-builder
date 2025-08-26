
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { templates } from '../TemplateConfig';
import { ActionButtons } from './ActionButtons';
import { CompactCompletionIndicator } from '../ResumeCompletionIndicator';

interface HeaderProps {
  selectedTemplate: string;
  font: string;
  color: string;
}

export const Header: React.FC<HeaderProps> = ({ selectedTemplate, font, color }) => {
  const navigate = useNavigate();

  const handlePreview = () => {
    localStorage.setItem('selectedTemplate', selectedTemplate);
    localStorage.setItem('resumeFont', font);
    localStorage.setItem('resumeColor', color);
    navigate('/preview');
  };

  const handleExport = () => {
    // Export logic here
    console.log('Exporting resume...');
  };

  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/templates')}
              className="inline-flex items-center text-gray-600 hover:text-gray-900 mr-6"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Templates
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Resume Builder</h1>
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  Using {templates.find((t) => t.id === selectedTemplate)?.name} template
                </p>
                <CompactCompletionIndicator />
              </div>
            </div>
          </div>
          <ActionButtons onPreview={handlePreview} onExport={handleExport} />
        </div>
      </div>
    </div>
  );
};
