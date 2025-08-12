import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { templates } from '../components/TemplateConfig';
import { samplePreviewResume } from '../data/sample';

const TemplatesPreview: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState(templates[3].id);
  
  // Sample resume data for preview - Data Analyst template

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
                  resume: samplePreviewResume,
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
