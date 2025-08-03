import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import { Resume, JobDescription } from '../types';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    company: '',
    description: '',
    requirements: []
  });
  const [userBackground, setUserBackground] = useState('');

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const parsedResume = await apiService.parseResume(file);
      localStorage.setItem('currentResume', JSON.stringify(parsedResume));
      navigate('/builder');
    } catch (error) {
      console.error('Error parsing resume:', error);
      alert('Failed to parse resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateFromJob = async () => {
    if (!jobDescription.title || !jobDescription.company) {
      alert('Please fill in at least the job title and company.');
      return;
    }

    setIsLoading(true);
    try {
      const generatedResume = await apiService.generateResume({
        job_description: jobDescription,
        user_background: userBackground || undefined
      });
      localStorage.setItem('currentResume', JSON.stringify(generatedResume));
      navigate('/builder');
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI-Powered Resume Builder
        </h1>
        <p className="text-xl text-gray-600">
          Create, optimize, and tailor your resume with the power of AI
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Existing Resume */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            📄 Upload Existing Resume
          </h2>
          <p className="text-gray-600 mb-4">
            Upload your current resume (PDF, DOCX, or TXT) and we'll parse it for editing
          </p>
          <div className="mb-4">
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <button
            onClick={() => uploadedFile && handleFileUpload(uploadedFile)}
            disabled={!uploadedFile || isLoading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Parsing...' : 'Parse Resume'}
          </button>
        </div>

        {/* Generate from Job Description */}
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            🚀 Generate from Job Description
          </h2>
          <p className="text-gray-600 mb-4">
            Paste a job description and we'll create a tailored resume template
          </p>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Job Title"
              value={jobDescription.title}
              onChange={(e) => setJobDescription(prev => ({ ...prev, title: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Company Name"
              value={jobDescription.company}
              onChange={(e) => setJobDescription(prev => ({ ...prev, company: e.target.value }))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Job Description"
              value={jobDescription.description}
              onChange={(e) => setJobDescription(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <textarea
              placeholder="Your background (optional)"
              value={userBackground}
              onChange={(e) => setUserBackground(e.target.value)}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleGenerateFromJob}
            disabled={isLoading || !jobDescription.title || !jobDescription.company}
            className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generating...' : 'Generate Resume'}
          </button>
        </div>
      </div>

      {/* Start from Scratch */}
      <div className="mt-8 text-center">
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">
            ✏️ Start from Scratch
          </h2>
          <p className="text-gray-600 mb-4">
            Build your resume from the ground up with our intuitive editor
          </p>
          <button
            onClick={() => {
              localStorage.removeItem('currentResume');
              navigate('/builder');
            }}
            className="bg-purple-500 text-white py-2 px-6 rounded-lg hover:bg-purple-600"
          >
            Start Building
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;

