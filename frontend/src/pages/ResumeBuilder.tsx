import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Resume, Experience, Education, Project, Certification } from '../types';
import { templates } from '../components/TemplateConfig';
import { apiService } from '../services/api';

const ResumeBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [currentResume, setCurrentResume] = useState<Resume | null>(null);
  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#2563eb');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [activeSection, setActiveSection] = useState('personal');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sectionOrder] = useState([
    'personal',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications'
  ]);

  const sections = {
    personal: { name: 'Personal Info', icon: '👤' },
    summary: { name: 'Professional Summary', icon: '📝' },
    experience: { name: 'Work Experience', icon: '💼' },
    education: { name: 'Education', icon: '🎓' },
    skills: { name: 'Skills', icon: '🛠️' },
    projects: { name: 'Projects', icon: '🚀' },
    certifications: { name: 'Certifications', icon: '🏆' }
  };

  const fontOptions = [
    { value: 'font-sans', name: 'Sans Serif (Modern)', example: 'Aa' },
    { value: 'font-serif', name: 'Serif (Traditional)', example: 'Aa' },
    { value: 'font-mono', name: 'Monospace (Technical)', example: 'Aa' }
  ];

  const colorPresets = [
    { name: 'Professional Blue', value: '#2563eb' },
    { name: 'Business Gray', value: '#374151' },
    { name: 'Creative Purple', value: '#7c3aed' },
    { name: 'Modern Green', value: '#059669' },
    { name: 'Bold Red', value: '#dc2626' },
    { name: 'Elegant Navy', value: '#1e3a8a' }
  ];

  useEffect(() => {
    const storedResume = localStorage.getItem('currentResume');
    const storedTemplate = localStorage.getItem('selectedTemplate');
    
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
    
    if (storedResume) {
      setCurrentResume(JSON.parse(storedResume));
    } else {
      // Initialize with empty resume
      setCurrentResume({
        personal_info: {
          full_name: '',
          email: '',
          phone: '',
          location: '',
          linkedin: '',
          github: '',
          website: ''
        },
        professional_summary: '',
        skills: [],
        experience: [],
        education: [],
        projects: [],
        certifications: []
      });
    }
  }, []);

  // Save resume to localStorage whenever it changes
  useEffect(() => {
    if (currentResume) {
      localStorage.setItem('currentResume', JSON.stringify(currentResume));
    }
  }, [currentResume]);

  const updateResume = (updates: Partial<Resume>) => {
    setCurrentResume(prev => prev ? { ...prev, ...updates } : null);
  };

  const updatePersonalInfo = (field: string, value: string) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      personal_info: { ...prev.personal_info, [field]: value }
    } : null);
  };

  const addExperience = () => {
    const newExperience: Experience = {
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      description: [''],
      is_current: false
    };
    setCurrentResume(prev => prev ? {
      ...prev,
      experience: [...prev.experience, newExperience]
    } : null);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      experience: prev.experience.map((exp, i) => i === index ? { ...exp, ...updates } : exp)
    } : null);
  };

  const deleteExperience = (index: number) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    } : null);
  };

  const addEducation = () => {
    const newEducation: Education = {
      institution: '',
      degree: '',
      field_of_study: '',
      start_date: '',
      end_date: '',
      gpa: ''
    };
    setCurrentResume(prev => prev ? {
      ...prev,
      education: [...prev.education, newEducation]
    } : null);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      education: prev.education.map((edu, i) => i === index ? { ...edu, ...updates } : edu)
    } : null);
  };

  const deleteEducation = (index: number) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    } : null);
  };

  const addProject = () => {
    const newProject: Project = {
      name: '',
      description: '',
      technologies: [],
      url: ''
    };
    setCurrentResume(prev => prev ? {
      ...prev,
      projects: [...prev.projects, newProject]
    } : null);
  };

  const updateProject = (index: number, updates: Partial<Project>) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      projects: prev.projects.map((proj, i) => i === index ? { ...proj, ...updates } : proj)
    } : null);
  };

  const deleteProject = (index: number) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      projects: prev.projects.filter((_, i) => i !== index)
    } : null);
  };

  const addCertification = () => {
    const newCert: Certification = {
      name: '',
      issuing_organization: '',
      issue_date: '',
      expiration_date: '',
      credential_id: ''
    };
    setCurrentResume(prev => prev ? {
      ...prev,
      certifications: [...prev.certifications, newCert]
    } : null);
  };

  const updateCertification = (index: number, updates: Partial<Certification>) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      certifications: prev.certifications.map((cert, i) => i === index ? { ...cert, ...updates } : cert)
    } : null);
  };

  const deleteCertification = (index: number) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    } : null);
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && currentResume && !currentResume.skills.includes(skill.trim())) {
      setCurrentResume(prev => prev ? {
        ...prev,
        skills: [...prev.skills, skill.trim()]
      } : null);
    }
  };

  const removeSkill = (index: number) => {
    setCurrentResume(prev => prev ? {
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index)
    } : null);
  };

  const generateAiSummary = async () => {
    if (!currentResume) return;
    
    setIsAiLoading(true);
    try {
      // Create a simplified prompt based on current resume data
      const userBackground = `
        Skills: ${currentResume.skills.join(', ')}
        Experience: ${currentResume.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
        Education: ${currentResume.education.map(edu => `${edu.degree} in ${edu.field_of_study} from ${edu.institution}`).join(', ')}
      `.trim();

      // Generate a fake job description for the AI to work with
      const fakeJobDescription = {
        title: "Professional Role",
        company: "Generic Company",
        description: "Looking for a skilled professional",
        requirements: currentResume.skills.slice(0, 3)
      };

      const response = await apiService.generateResume({
        job_description: fakeJobDescription,
        user_background: userBackground
      });

      if (response?.professional_summary) {
        updateResume({ professional_summary: response.professional_summary });
      } else {
        // Fallback to local generation if API fails
        const aiSummary = `Results-driven professional with expertise in ${currentResume.skills.slice(0, 3).join(', ')} and proven track record of delivering high-impact solutions. Passionate about innovation and continuous learning.`;
        updateResume({ professional_summary: aiSummary });
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      // Fallback to local generation
      const aiSummary = `Experienced professional with strong background in ${currentResume.skills.slice(0, 3).join(', ')}. Demonstrated ability to deliver results and drive innovation in dynamic environments.`;
      updateResume({ professional_summary: aiSummary });
    } finally {
      setIsAiLoading(false);
    }
  };

  const renderTemplatePreview = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template || !currentResume) return null;

    return React.createElement(template.component, {
      resume: currentResume,
      color,
      font
    });
  };

  if (!currentResume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                <h1 className="text-2xl font-bold text-gray-900">
                  Resume Builder
                </h1>
                <p className="text-sm text-gray-600">
                  Using {templates.find(t => t.id === selectedTemplate)?.name} template
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  localStorage.setItem('selectedTemplate', selectedTemplate);
                  localStorage.setItem('resumeFont', font);
                  localStorage.setItem('resumeColor', color);
                  navigate('/preview');
                }}
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Preview Resume
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Sidebar - Sections */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Selector */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Template</h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`border rounded-lg p-3 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-sm text-gray-900">{template.name}</h4>
                        <p className="text-xs text-gray-600">{template.profession}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Customization */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize</h3>
              
              {/* Font Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Font Style</label>
                <div className="space-y-2">
                  {fontOptions.map((fontOption) => (
                    <label key={fontOption.value} className="flex items-center">
                      <input
                        type="radio"
                        name="font"
                        value={fontOption.value}
                        checked={font === fontOption.value}
                        onChange={(e) => setFont(e.target.value)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <span className="ml-3 text-sm">
                        <span className={`${fontOption.value} text-lg font-medium`}>
                          {fontOption.example}
                        </span>
                        <span className="text-gray-600 ml-2">{fontOption.name}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {colorPresets.map((colorOption) => (
                    <button
                      key={colorOption.value}
                      onClick={() => setColor(colorOption.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        color === colorOption.value
                          ? 'border-gray-400 ring-2 ring-gray-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      title={colorOption.name}
                    >
                      <div
                        className="w-full h-8 rounded"
                        style={{ backgroundColor: colorOption.value }}
                      ></div>
                    </button>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">Custom Color</span>
                </div>
              </div>
            </div>

            {/* Section Navigation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {sectionOrder.map((sectionKey) => {
                  const section = sections[sectionKey as keyof typeof sections];
                  return (
                    <button
                      key={sectionKey}
                      onClick={() => setActiveSection(sectionKey)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        activeSection === sectionKey
                          ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <span className="mr-3">{section.icon}</span>
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Center - Form Editor */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <span className="mr-3">{sections[activeSection as keyof typeof sections]?.icon}</span>
                  {sections[activeSection as keyof typeof sections]?.name}
                </h2>
              </div>

              <div className="space-y-6">
                {/* Personal Information */}
                {activeSection === 'personal' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        value={currentResume.personal_info.full_name}
                        onChange={(e) => updatePersonalInfo('full_name', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          value={currentResume.personal_info.email}
                          onChange={(e) => updatePersonalInfo('email', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          value={currentResume.personal_info.phone}
                          onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                      <input
                        type="text"
                        value={currentResume.personal_info.location}
                        onChange={(e) => updatePersonalInfo('location', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="New York, NY"
                      />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                          type="url"
                          value={currentResume.personal_info.linkedin}
                          onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="linkedin.com/in/johndoe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                        <input
                          type="url"
                          value={currentResume.personal_info.github}
                          onChange={(e) => updatePersonalInfo('github', e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="github.com/johndoe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                      <input
                        type="url"
                        value={currentResume.personal_info.website}
                        onChange={(e) => updatePersonalInfo('website', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="johndoe.com"
                      />
                    </div>
                  </div>
                )}

                {/* Professional Summary */}
                {activeSection === 'summary' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                      <textarea
                        value={currentResume.professional_summary}
                        onChange={(e) => updateResume({ professional_summary: e.target.value })}
                        rows={6}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Write a compelling summary that highlights your key strengths and career achievements..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {currentResume.professional_summary.length}/500 characters
                      </p>
                    </div>
                    <button
                      onClick={generateAiSummary}
                      disabled={isAiLoading || currentResume.skills.length === 0}
                      className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isAiLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Generating with AI...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          Generate with AI
                        </>
                      )}
                    </button>
                    {currentResume.skills.length === 0 && (
                      <p className="text-xs text-gray-500">
                        Add some skills first to get a better AI-generated summary
                      </p>
                    )}
                  </div>
                )}

                {/* Skills */}
                {activeSection === 'skills' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Your Skills</label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentResume.skills.map((skill, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                          >
                            {skill}
                            <button
                              onClick={() => removeSkill(index)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              addSkill(e.currentTarget.value);
                              e.currentTarget.value = '';
                            }
                          }}
                          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Add a skill and press Enter"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Press Enter to add each skill
                      </p>
                    </div>
                  </div>
                )}

                {/* Work Experience */}
                {activeSection === 'experience' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
                      <button
                        onClick={addExperience}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Experience
                      </button>
                    </div>
                    
                    {currentResume.experience.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-4xl mb-4">💼</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No work experience added yet</h4>
                        <p className="text-gray-600 mb-4">Add your work experience to showcase your professional background</p>
                        <button
                          onClick={addExperience}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Your First Job
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentResume.experience.map((exp, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                            <button
                              onClick={() => deleteExperience(index)}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                <input
                                  type="text"
                                  value={exp.position}
                                  onChange={(e) => updateExperience(index, { position: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. Software Engineer"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                <input
                                  type="text"
                                  value={exp.company}
                                  onChange={(e) => updateExperience(index, { company: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. Google"
                                />
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                                <input
                                  type="month"
                                  value={exp.start_date}
                                  onChange={(e) => updateExperience(index, { start_date: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                  type="month"
                                  value={exp.end_date}
                                  onChange={(e) => updateExperience(index, { end_date: e.target.value })}
                                  disabled={exp.is_current}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                              </div>
                              <div className="flex items-end">
                                <label className="flex items-center">
                                  <input
                                    type="checkbox"
                                    checked={exp.is_current}
                                    onChange={(e) => updateExperience(index, { 
                                      is_current: e.target.checked,
                                      end_date: e.target.checked ? '' : exp.end_date
                                    })}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                  />
                                  <span className="ml-2 text-sm text-gray-700">Current Position</span>
                                </label>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
                              <div className="space-y-2">
                                {exp.description.map((desc, descIndex) => (
                                  <div key={descIndex} className="flex items-start space-x-2">
                                    <textarea
                                      value={desc}
                                      onChange={(e) => {
                                        const newDescription = [...exp.description];
                                        newDescription[descIndex] = e.target.value;
                                        updateExperience(index, { description: newDescription });
                                      }}
                                      rows={2}
                                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                      placeholder="• Describe your key achievement or responsibility..."
                                    />
                                    {exp.description.length > 1 && (
                                      <button
                                        onClick={() => {
                                          const newDescription = exp.description.filter((_, i) => i !== descIndex);
                                          updateExperience(index, { description: newDescription });
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={() => {
                                    const newDescription = [...exp.description, ''];
                                    updateExperience(index, { description: newDescription });
                                  }}
                                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                  </svg>
                                  Add Bullet Point
                                </button>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                Add bullet points describing your key achievements and responsibilities
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Education */}
                {activeSection === 'education' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Education</h3>
                      <button
                        onClick={addEducation}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Education
                      </button>
                    </div>
                    
                    {currentResume.education.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-4xl mb-4">🎓</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No education added yet</h4>
                        <p className="text-gray-600 mb-4">Add your educational background to showcase your qualifications</p>
                        <button
                          onClick={addEducation}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Your First Degree
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentResume.education.map((edu, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                            <button
                              onClick={() => deleteEducation(index)}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                                <input
                                  type="text"
                                  value={edu.institution}
                                  onChange={(e) => updateEducation(index, { institution: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. Harvard University"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                                <input
                                  type="text"
                                  value={edu.degree}
                                  onChange={(e) => updateEducation(index, { degree: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. Bachelor of Science"
                                />
                              </div>
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study *</label>
                              <input
                                type="text"
                                value={edu.field_of_study}
                                onChange={(e) => updateEducation(index, { field_of_study: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. Computer Science"
                              />
                            </div>
                            
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input
                                  type="month"
                                  value={edu.start_date}
                                  onChange={(e) => updateEducation(index, { start_date: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input
                                  type="month"
                                  value={edu.end_date}
                                  onChange={(e) => updateEducation(index, { end_date: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">GPA (Optional)</label>
                                <input
                                  type="text"
                                  value={edu.gpa}
                                  onChange={(e) => updateEducation(index, { gpa: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. 3.8/4.0"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Projects */}
                {activeSection === 'projects' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Projects</h3>
                      <button
                        onClick={addProject}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Project
                      </button>
                    </div>
                    
                    {currentResume.projects.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-4xl mb-4">🚀</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No projects added yet</h4>
                        <p className="text-gray-600 mb-4">Showcase your projects to demonstrate your skills and experience</p>
                        <button
                          onClick={addProject}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Your First Project
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentResume.projects.map((project, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                            <button
                              onClick={() => deleteProject(index)}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                              <input
                                type="text"
                                value={project.name}
                                onChange={(e) => updateProject(index, { name: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. E-commerce Website"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Project URL (Optional)</label>
                              <input
                                type="url"
                                value={project.url}
                                onChange={(e) => updateProject(index, { url: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="https://github.com/username/project"
                              />
                            </div>
                            
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                              <textarea
                                value={project.description}
                                onChange={(e) => updateProject(index, { description: e.target.value })}
                                rows={3}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Describe your project, its purpose, and your contributions..."
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used</label>
                              <div className="flex flex-wrap gap-2 mb-3">
                                {project.technologies.map((tech, techIndex) => (
                                  <span
                                    key={techIndex}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                                  >
                                    {tech}
                                    <button
                                      onClick={() => {
                                        const newTech = project.technologies.filter((_, i) => i !== techIndex);
                                        updateProject(index, { technologies: newTech });
                                      }}
                                      className="ml-2 text-green-600 hover:text-green-800"
                                    >
                                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    </button>
                                  </span>
                                ))}
                              </div>
                              <input
                                type="text"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                                    const newTech = [...project.technologies, e.currentTarget.value.trim()];
                                    updateProject(index, { technologies: newTech });
                                    e.currentTarget.value = '';
                                  }
                                }}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add a technology and press Enter"
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Press Enter to add each technology (e.g. React, Node.js, MongoDB)
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Certifications */}
                {activeSection === 'certifications' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
                      <button
                        onClick={addCertification}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Certification
                      </button>
                    </div>
                    
                    {currentResume.certifications.length === 0 ? (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <div className="text-4xl mb-4">🏆</div>
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No certifications added yet</h4>
                        <p className="text-gray-600 mb-4">Add your professional certifications to boost your credibility</p>
                        <button
                          onClick={addCertification}
                          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Add Your First Certification
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {currentResume.certifications.map((cert, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-6 relative">
                            <button
                              onClick={() => deleteCertification(index)}
                              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
                                <input
                                  type="text"
                                  value={cert.name}
                                  onChange={(e) => updateCertification(index, { name: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. AWS Solutions Architect"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization *</label>
                                <input
                                  type="text"
                                  value={cert.issuing_organization}
                                  onChange={(e) => updateCertification(index, { issuing_organization: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  placeholder="e.g. Amazon Web Services"
                                />
                              </div>
                            </div>
                            
                            <div className="grid md:grid-cols-2 gap-4 mb-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
                                <input
                                  type="month"
                                  value={cert.issue_date}
                                  onChange={(e) => updateCertification(index, { issue_date: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date (Optional)</label>
                                <input
                                  type="month"
                                  value={cert.expiration_date}
                                  onChange={(e) => updateCertification(index, { expiration_date: e.target.value })}
                                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID (Optional)</label>
                              <input
                                type="text"
                                value={cert.credential_id}
                                onChange={(e) => updateCertification(index, { credential_id: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="e.g. AWS-SAA-123456789"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Live Preview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Zoom out"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                    </svg>
                  </button>
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Zoom in"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                <div className={`bg-white shadow-lg mx-auto transform scale-75 origin-top ${font}`} style={{ color }}>
                  <div className="p-6">
                    {renderTemplatePreview()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;

