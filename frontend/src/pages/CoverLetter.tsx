import React, { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { resumeService } from '../services/resumeService';
import { pdf } from '@react-pdf/renderer';
import CoverLetterPDF from '../components/CoverLetterPDF';
import { FiDownload, FiFileText } from 'react-icons/fi';
import { type Resume, type Skill } from '../types';

const CoverLetter: React.FC = () => {
  const { resume } = useResumeStore();
  const [jobDescription, setJobDescription] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste the job description.');
      return;
    }
    if (!resume) {
      setError('Resume data is not available.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCoverLetter('');

    try {
      const lines = jobDescription.split('\n');
      const title = lines.find(line => line.toLowerCase().startsWith('title:'))?.split('title:')[1].trim() || 'Software Engineer';
      const company = lines.find(line => line.toLowerCase().startsWith('company:'))?.split('company:')[1].trim() || 'Acme Corp';
      const description = lines.filter(line => !line.toLowerCase().startsWith('title:') && !line.toLowerCase().startsWith('company:')).join('\n');

      const job = {
        title,
        company,
        description,
        requirements: [],
      };

      console.log("resume-----", resume)
      const transformedResume: Resume = {
        ...resume,
        skills: resume.skills.map((skill: Skill) => {
          if (typeof skill === 'string') {
            return { name: skill, category_id: 'N/A', category: 'N/A', level: 'intermediate' } as Skill;
          }
          return skill;
        }),
        experience: resume.experience.map(exp => ({
          ...exp,
          end_date: exp.end_date === '' ? undefined : exp.end_date,
        })),
      };

      const response = await resumeService.generateCoverLetter(transformedResume, job);
      setCoverLetter(response.cover_letter);
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportPDF = async () => {
    if (!coverLetter) return;

    try {
      const blob = await pdf(<CoverLetterPDF coverLetter={coverLetter} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'cover_letter.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Generate Cover Letter</h1>

      <div className="mb-6">
        <label htmlFor="job-description" className="block text-lg font-medium mb-2">
          Paste Job Description
        </label>
        <textarea
          id="job-description"
          rows={10}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Paste the full job description here..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
        >
          <FiFileText className="mr-2" />
          {isLoading ? 'Generating...' : 'Generate Cover Letter'}
        </button>
        {coverLetter && (
          <button
            onClick={handleExportPDF}
            className="flex items-center bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600"
          >
            <FiDownload className="mr-2" />
            Export as PDF
          </button>
        )}
      </div>

      {error && <p className="text-red-500 mt-4">{error}</p>}

      {coverLetter && (
        <div className="mt-8 p-6 border border-gray-200 rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-bold mb-4">Generated Cover Letter</h2>
          <pre className="whitespace-pre-wrap font-sans text-base">{coverLetter}</pre>
        </div>
      )}
    </div>
  );
};

export default CoverLetter;
