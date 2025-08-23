import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { templates } from '../components/TemplateConfig';
import { apiService } from '../services/api';
import { useToast } from '../components/ToastProvider';
import { useResumeStore } from '../store/resumeStore';
import { useResumeManagerStore } from '../store/resumeManagerStore';
import type { JobDescription, Resume } from '../types';
import { sampleTemplateResume } from '../data/sample';
import { professions } from '../utils/settings';

const TemplateSelection: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const { setResume } = useResumeStore();
  const { createResume, setActiveResume } = useResumeManagerStore();
  const currentResume = useResumeStore((s) => s.resume);
  const [activeTab, setActiveTab] = useState<'templates' | 'upload' | 'generate'>('templates');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [isLoading, setIsLoading] = useState(false);
  
  // Upload states
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const MAX_BYTES = 10 * 1024 * 1024; // 10MB
  const allowedExtensions = ['.pdf', '.docx', '.txt'];

  const validateFile = (file: File): boolean => {
    const nameLower = file.name.toLowerCase();
    const hasAllowedExt = allowedExtensions.some((ext) => nameLower.endsWith(ext));
    if (!hasAllowedExt) {
      toast.error('Unsupported file type. Use PDF, DOCX, or TXT.');
      return false;
    }
    if (file.size > MAX_BYTES) {
      toast.error('File too large. Max size is 10MB.');
      return false;
    }
    return true;
  };
  
  // AI Generation states
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    company: '',
    description: '',
    requirements: []
  });
  const [userBackground, setUserBackground] = useState('');
  const [profession, setProfession] = useState('');
  const [tailorExisting, setTailorExisting] = useState(false);
  

  useEffect(() => {
    // Check if coming from home page with specific flow
    const resumeFlow = localStorage.getItem('resumeFlow');
    const defaultTab = location.state?.defaultTab;
    
    if (defaultTab) {
      setActiveTab(defaultTab);
    } else if (resumeFlow && resumeFlow !== 'templates') {
      setActiveTab(resumeFlow as 'upload' | 'generate');
    }
  }, [location.state]);

  // Determine if the store resume has meaningful data
  const isResumeEmpty = (r: Resume | null | undefined) => {
    if (!r) return true;
    const hasName = Boolean(r.personal_info?.full_name?.trim());
    const hasSummary = Boolean(r.professional_summary?.trim());
    const hasAnyList = (r.skills?.length || 0) > 0 || (r.experience?.length || 0) > 0 || (r.education?.length || 0) > 0 || (r.projects?.length || 0) > 0 || (r.certifications?.length || 0) > 0;
    return !(hasName || hasSummary || hasAnyList);
  };

  // Default the toggle based on whether there is an existing resume
  useEffect(() => {
    setTailorExisting(!isResumeEmpty(currentResume));
  }, [currentResume]);

  // Template thumbnail generator
  const generateThumbnail = (template: any) => {
    return React.createElement(template.component, {
      resume: sampleTemplateResume,
      color: '#2563eb',
      font: 'font-sans'
    });
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleStartWithTemplate = () => {
    localStorage.setItem('selectedTemplate', selectedTemplate);
    // Reset the store to an empty resume by setting an empty shape
    setResume({
      personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
      professional_summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: []
    });
    const created = createResume('New Resume', {
      personal_info: { full_name: '', email: '', phone: '', location: '', linkedin: '', github: '', website: '' },
      professional_summary: '',
      skills: [],
      experience: [],
      education: [],
      projects: [],
      certifications: []
    });
    setActiveResume(created.id);
    navigate('/builder');
  };

  // File upload handlers
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const parsedResume = await apiService.parseAndSaveResume(selectedFile);
      setResume(parsedResume);
      const created = createResume(`${parsedResume.personal_info?.full_name || 'Imported'} Resume`, parsedResume);
      setActiveResume(created.id);
      localStorage.setItem('selectedTemplate', selectedTemplate);
      navigate('/builder');
    } catch (error) {
      console.error('Error parsing resume:', error);
      toast.error('Failed to parse resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          if (event.target?.result) {
            const jsonData = JSON.parse(event.target.result as string);
            setResume(jsonData);
            const created = createResume(`${jsonData?.personal_info?.full_name || 'Imported'} Resume`, jsonData);
            setActiveResume(created.id);
            localStorage.setItem('selectedTemplate', selectedTemplate);
            navigate('/builder');
          }
        } catch (error) {
          console.error('Error parsing JSON file:', error);
          toast.error('Invalid JSON. Please ensure it\'s a valid resume JSON.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateFromJob = async () => {
    if (!jobDescription.title || !jobDescription.company) {
      alert('Please fill in at least the job title and company.');
      return;
    }

    setIsLoading(true);
    try {
      let result: Resume;
      if (tailorExisting && !isResumeEmpty(currentResume)) {
        result = await apiService.optimizeResume({
          resume: currentResume,
          job_description: jobDescription,
        });
      } else {
        result = await apiService.generateResume({
          job_description: jobDescription,
          user_background: userBackground || undefined,
        });
      }

      setResume(result);
      const name = tailorExisting ? `${result.personal_info?.full_name || 'Tailored'} Resume` : `${jobDescription.title} @ ${jobDescription.company}`;
      const created = createResume(name, result);
      setActiveResume(created.id);
      localStorage.setItem('selectedProfession', profession);
      // Force Basic template as requested
      localStorage.setItem('selectedTemplate', 'basic');
      navigate('/builder');
    } catch (error) {
      console.error('Error generating resume:', error);
      toast.error('Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 text-sm font-medium"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Build, Tailor, and Switch Between Resumes Fast
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Clarify your value with AI-tailored content and ATS-friendly templates. Create multiple versions per job.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <nav className="flex space-x-8 bg-white rounded-lg shadow-sm p-1">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'templates'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                </svg>
                Choose Template
              </div>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload Resume
              </div>
            </button>
            <button
              onClick={() => setActiveTab('generate')}
              className={`px-6 py-3 rounded-md font-medium transition-all ${
                activeTab === 'generate'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                AI Generate
              </div>
            </button>
          </nav>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Template Selection Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Select Template
              </h3>
              <div className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => handleTemplateSelect(template.id)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">{template.profession}</p>
                      </div>
                      {selectedTemplate === template.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Template Preview Tab */}
              {activeTab === 'templates' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {templates.find(t => t.id === selectedTemplate)?.name} Template
                    </h2>
                    <p className="text-gray-600">
                      Perfect for {templates.find(t => t.id === selectedTemplate)?.profession} professionals
                    </p>
                  </div>

                  {/* Template Preview */}
                  <div className="bg-gray-50 rounded-lg p-6 mb-8">
                    <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
                      <div className="transform scale-75 origin-top">
                        {templates.find(t => t.id === selectedTemplate) && 
                          generateThumbnail(templates.find(t => t.id === selectedTemplate)!)
                        }
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={handleStartWithTemplate}
                      className="inline-flex items-center px-8 py-4 bg-blue-600 text-white text-lg font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Start with This Template
                      <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Upload Resume Tab */}
              {activeTab === 'upload' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Upload Your Resume
                    </h2>
                    <p className="text-gray-600">
                      Upload your existing resume and we'll apply the {templates.find(t => t.id === selectedTemplate)?.name} template
                    </p>
                  </div>

                  {/* File Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-xl p-12 text-center mb-6 transition-colors ${
                      dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-lg text-gray-900 mb-2">
                          Drag and drop your resume here
                        </p>
                        <p className="text-gray-600 mb-4">
                          or{' '}
                          <label className="text-blue-600 hover:text-blue-700 cursor-pointer font-medium">
                            browse files
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.docx,.txt"
                              onChange={handleFileChange}
                            />
                          </label>
                        </p>
                        <p className="text-sm text-gray-500">
                          Supports PDF, DOCX, TXT files up to 10MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {selectedFile && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center mr-3">
                            <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{selectedFile.name}</p>
                            <p className="text-sm text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button
                          onClick={handleUpload}
                          disabled={isLoading}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                        >
                          {isLoading ? 'Processing...' : 'Upload & Continue'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* JSON Upload Option */}
                  <div className="border-t pt-6">
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">Already have a resume in JSON format?</p>
                      <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer text-gray-700 font-medium">
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V4a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414A1 1 0 0120 6.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4a2 2 0 012-2h2a1 1 0 011 1v2z" />
                        </svg>
                        Import JSON File
                        <input
                          type="file"
                          className="hidden"
                          accept=".json"
                          onChange={handleJsonUpload}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Generate Tab */}
              {activeTab === 'generate' && (
                <div className="p-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      AI-Generated Resume
                    </h2>
                    <p className="text-gray-600">
                      Provide job details and let AI create a tailored resume with the Basic template
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Tailor Existing Toggle */}
                    <div className="flex items-center justify-between bg-gray-50 border rounded-lg p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Tailor my existing resume</p>
                        <p className="text-xs text-gray-600">If enabled, AI will optimize your current resume for this job. Otherwise, it will generate a new one.</p>
                      </div>
                      <label className="inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={tailorExisting}
                          onChange={(e) => setTailorExisting(e.target.checked)}
                          disabled={isResumeEmpty(currentResume)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-400 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 relative"></div>
                      </label>
                    </div>

                    {/* Profession Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Profession
                      </label>
                      <select
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={profession}
                        onChange={(e) => setProfession(e.target.value)}
                      >
                        <option value="">Select your profession</option>
                        {professions.map((prof) => (
                          <option key={prof} value={prof}>
                            {prof}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Job Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Job Title *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={jobDescription.title}
                          onChange={(e) => setJobDescription({ ...jobDescription, title: e.target.value })}
                          placeholder="e.g. Senior Software Engineer"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Company *
                        </label>
                        <input
                          type="text"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={jobDescription.company}
                          onChange={(e) => setJobDescription({ ...jobDescription, company: e.target.value })}
                          placeholder="e.g. Tech Innovations Inc."
                        />
                      </div>
                    </div>

                    {/* Job Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Job Description
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={5}
                        value={jobDescription.description}
                        onChange={(e) => setJobDescription({ ...jobDescription, description: e.target.value })}
                        placeholder="Paste the full job description here..."
                      />
                    </div>

                    {/* Requirements */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Key Requirements
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        value={jobDescription.requirements.join('\n')}
                        onChange={(e) => setJobDescription({
                          ...jobDescription,
                          requirements: e.target.value.split('\n').filter(Boolean)
                        })}
                        placeholder="List key requirements (one per line)&#10;• 5+ years experience&#10;• Proficient in React&#10;• Strong communication skills"
                      />
                    </div>

                    {/* Background Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Background (Optional)
                      </label>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={4}
                        value={userBackground}
                        onChange={(e) => setUserBackground(e.target.value)}
                        placeholder="Tell us about your experience, education, and skills to help AI create a better resume..."
                      />
                    </div>

                    <div className="text-center pt-4">
                      <button
                        className="px-8 py-4 bg-purple-600 text-white text-lg font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        onClick={handleGenerateFromJob}
                        disabled={isLoading || !jobDescription.title || !jobDescription.company}
                      >
                        {isLoading ? (
                          <div className="flex items-center">
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Generating Resume...
                          </div>
                        ) : (
                          'Generate My Resume'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'upload' ? 'Processing Your Resume' : 'Generating Resume'}
            </h3>
            <p className="text-gray-600">
              This may take a moment. Please don't close this window.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateSelection;
