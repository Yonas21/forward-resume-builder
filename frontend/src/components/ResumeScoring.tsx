import React, { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { resumeService } from '../services/resumeService';

interface ScoringResult {
  score: number;
  feedback: string[];
  suggestions: string[];
}

export const ResumeScoring: React.FC = () => {
  const { resume } = useResumeStore();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ScoringResult | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [showJobDescription, setShowJobDescription] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  const handleScoreResume = async () => {
    setIsLoading(true);
    try {
      console.log('Sending resume data for scoring:', resume);
      const scoringResult = await resumeService.scoreResume(
        resume,
        jobDescription || undefined
      );
      setResult(scoringResult);
    } catch (error: any) {
      console.error('Failed to score resume:', error);
      // Show error message to user
      if (error.response?.data?.detail) {
        alert(`Error: ${error.response.data.detail}`);
      } else {
        alert('Failed to analyze resume. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Resume Analysis
        </h3>
        <button
          onClick={() => setShowJobDescription(!showJobDescription)}
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          {showJobDescription ? 'Hide' : 'Add'} Job Description
        </button>
      </div>

      {showJobDescription && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description to get targeted feedback..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        </div>
      )}

      <button
        onClick={handleScoreResume}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? 'Analyzing...' : 'Analyze Resume'}
      </button>

      {result && (
        <div className="mt-6 space-y-4">
          {/* Score Display */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(result.score)}`}>
              {result.score}/100
            </div>
            <div className={`text-lg font-medium ${getScoreColor(result.score)}`}>
              {getScoreLabel(result.score)}
            </div>
          </div>

          {/* Feedback */}
          {result.feedback.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Strengths</h4>
              <ul className="space-y-1">
                {result.feedback.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Suggestions for Improvement</h4>
              <ul className="space-y-1">
                {result.suggestions.map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">💡</span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
