import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Resume } from '../types';

const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#333');

  useEffect(() => {
    const storedResume = localStorage.getItem('currentResume');
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
  }, []);

  const handleInputChange = (section: keyof Resume, field: string, value: any) => {
    setCurrentResume((prevResume) => {
      if (!prevResume) return null;
      return {
        ...prevResume,
        [section]: {
          ...prevResume[section],
          [field]: value,
        },
      };
    });
  };

  const handleArrayChange = (section: keyof Resume, index: number, field: string, value: any) => {
    setCurrentResume((prevResume) => {
      if (!prevResume) return null;
      const updatedSection = [...(prevResume[section] as any[])];
      updatedSection[index] = { ...updatedSection[index], [field]: value };
      return {
        ...prevResume,
        [section]: updatedSection,
      };
    });
  };

  const handleAddItem = (section: keyof Resume, newItem: any) => {
    setCurrentResume((prevResume) => {
      if (!prevResume) return null;
      const updatedSection = [...(prevResume[section] as any[]), newItem];
      return {
        ...prevResume,
        [section]: updatedSection,
      };
    });
  };

  const handleRemoveItem = (section: keyof Resume, index: number) => {
    setCurrentResume((prevResume) => {
      if (!prevResume) return null;
      const updatedSection = (prevResume[section] as any[]).filter((_, i) => i !== index);
      return {
        ...prevResume,
        [section]: updatedSection,
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
      <div className="bg-white shadow-lg rounded-lg p-8 mb-12">
        <div className="flex justify-between items-center mb-8">
          <select onChange={(e) => setFont(e.target.value)} className="p-2 border border-gray-300 rounded-lg">
            <option value="font-sans">Sans</option>
            <option value="font-serif">Serif</option>
            <option value="font-mono">Monospace</option>
          </select>
          <input
            type="color"
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 p-1 border border-gray-300 rounded-lg"
          />
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

