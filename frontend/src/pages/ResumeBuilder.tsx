import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resume } from '../types';
import TemplateSelector from '../components/TemplateSelector';
import { templates } from '../components/TemplateConfig';

const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#333');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [profession, setProfession] = useState('');

  useEffect(() => {
    const storedResume = localStorage.getItem('currentResume');
    const storedProfession = localStorage.getItem('selectedProfession');
    
    if (storedResume) {
      setCurrentResume(JSON.parse(storedResume));
    } else {
      setCurrentResume({
        personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
        professional_summary: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: []
      });
    }
    
    if (storedProfession) {
      setProfession(storedProfession);
      
      // Set default template based on profession
      const professionalTemplate = templates.find(t => 
        t.profession.toLowerCase().includes(storedProfession.toLowerCase())
      );
      
      if (professionalTemplate) {
        setSelectedTemplate(professionalTemplate.id);
      }
    }
  }, []);

  const handleInputChange = (section: keyof Resume, field: string, value: string | string[] | Array<Record<string, string>>) => {
    setCurrentResume((prevResume) => {
      if (!prevResume) return null;
      return {
        ...prevResume,
        [section]: typeof prevResume[section] === 'object' ? {
          ...(prevResume[section] as object),
          [field]: value,
        } : value,
      };
    });
  };

  if (!currentResume) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`container mx-auto px-4 py-12 font-light ${font}`} style={{ color }}>
      <h1 className="text-4xl font-bold mb-6 text-purple-600">
        Your Dream Job Starts with a Great Resume
      </h1>
      <p className="text-lg text-gray-600 mb-8">
        Create a perfect resume from scratch or import your existing one—our AI transforms it fast to beat ATS every time.
      </p>
      
      {/* Template Selection */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-12">
        <h2 className="text-2xl font-semibold mb-4">Choose Your Template</h2>
        <TemplateSelector 
          selectedTemplate={selectedTemplate} 
          onSelectTemplate={setSelectedTemplate}
          profession={profession}
        />
        
        <div className="mt-6 flex justify-between items-center mb-8">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Font Style</label>
            <select onChange={(e) => setFont(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
              <option value="font-sans">Sans</option>
              <option value="font-serif">Serif</option>
              <option value="font-mono">Monospace</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Color Scheme</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-10 p-1 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary</label>
          <textarea
            value={currentResume.professional_summary}
            onChange={(e) => handleInputChange('professional_summary', '', e.target.value)}
            rows={3}
            className="w-full resize-none p-2 border border-gray-300 rounded-lg mb-4"
          />
          <button className="bg-purple-600 text-white py-2 px-4 rounded">Write with AI</button>
        </div>
      </div>

      {/* Additional Sections Like Skills, Experience, Education, etc. can be added here similar to Professional Summary */}

      <button
        onClick={() => navigate('/preview')}
        className="bg-blue-600 text-white py-2 px-6 rounded-lg shadow-md hover:bg-blue-700"
      >
        Preview Resume
      </button>
    </div>
  );
};

export default ResumeBuilder;

