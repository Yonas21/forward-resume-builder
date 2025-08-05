import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import type { JobDescription } from '../types';
import FileUpload from '../components/FileUpload';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'upload' | 'generate'>('upload');
  const [jobDescription, setJobDescription] = useState<JobDescription>({
    title: '',
    company: '',
    description: '',
    requirements: []
  });
  const [userBackground, setUserBackground] = useState('');
  const [profession, setProfession] = useState('');
  
  const professions = [
    'Software Developer',
    'Data Analyst',
    'Data Engineer',
    'Business & Legal',
    'Creative & Tech',
    'Other'
  ];

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
      localStorage.setItem('selectedProfession', profession);
      navigate('/builder');
    } catch (error) {
      console.error('Error generating resume:', error);
      alert('Failed to generate resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Resume Builder</h1>
        <p className="text-gray-600 max-w-2xl mx-auto mb-4">
          Create a professional resume in minutes. Upload your existing resume for improvement or generate a new one based on a job description.
        </p>
        <div className="mt-6">
          <button
            onClick={() => navigate('/templates')}
            className="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
          >
            <span>Browse Resume Templates</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('upload')}
        >
          Upload Resume
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'generate' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('generate')}
        >
          Generate from Job Description
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'upload' ? (
          <div>
            <h2 className="text-xl font-semibold mb-4">Upload Your Resume</h2>
            <p className="text-gray-600 mb-4">
              Upload your existing resume in PDF or DOCX format. We'll parse it and help you improve it with professional templates.
            </p>
            <FileUpload setIsLoading={setIsLoading} />
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Generate Resume from Job Description</h2>
            <p className="text-gray-600 mb-4">
              Enter a job description and we'll generate a tailored resume for you.
            </p>

            <div className="space-y-4">
              {/* Profession Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Your Profession
                </label>
                <select
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                >
                  <option value="">Select a profession</option>
                  {professions.map((prof) => (
                    <option key={prof} value={prof}>
                      {prof}
                    </option>
                  ))}
                </select>
              </div>

              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title
                </label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={jobDescription.title}
                  onChange={(e) =>
                    setJobDescription({ ...jobDescription, title: e.target.value })
                  }
                  placeholder="e.g. Senior Software Engineer"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  value={jobDescription.company}
                  onChange={(e) =>
                    setJobDescription({ ...jobDescription, company: e.target.value })
                  }
                  placeholder="e.g. Tech Innovations Inc."
                />
              </div>

              {/* Job Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </label>
                <textarea
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={5}
                  value={jobDescription.description}
                  onChange={(e) =>
                    setJobDescription({
                      ...jobDescription,
                      description: e.target.value,
                    })
                  }
                  placeholder="Paste the job description here..."
                />
              </div>

              {/* Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Key Requirements (one per line)
                </label>
                <textarea
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  value={jobDescription.requirements.join('\n')}
                  onChange={(e) =>
                    setJobDescription({
                      ...jobDescription,
                      requirements: e.target.value.split('\n').filter(Boolean),
                    })
                  }
                  placeholder="e.g.\n5+ years of experience\nProficient in React\nStrong communication skills"
                />
              </div>

              {/* Background Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Background (optional)
                </label>
                <textarea
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={4}
                  value={userBackground}
                  onChange={(e) => setUserBackground(e.target.value)}
                  placeholder="Provide some information about your experience, education, and skills..."
                />
              </div>

              <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                onClick={handleGenerateFromJob}
                disabled={isLoading || !jobDescription.title || !jobDescription.company}
              >
                {isLoading ? 'Generating...' : 'Generate Resume'}
              </button>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-700">
              {activeTab === 'upload' ? 'Parsing your resume...' : 'Generating your resume...'}
            </p>
            <p className="text-gray-500 text-sm mt-2">This may take a moment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

