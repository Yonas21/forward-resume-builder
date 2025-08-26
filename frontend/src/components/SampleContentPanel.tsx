import React, { useState } from 'react';
import { SampleContent, getSampleContent, getAvailableIndustries } from '../data/sampleContent';

interface SampleContentPanelProps {
  section: string;
  onApplySample: (content: string) => void;
  industry?: string;
  className?: string;
}

export const SampleContentPanel: React.FC<SampleContentPanelProps> = ({
  section,
  onApplySample,
  industry,
  className = ''
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState(industry || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSample, setSelectedSample] = useState<SampleContent | null>(null);

  const availableIndustries = getAvailableIndustries();
  const samples = getSampleContent(section, selectedIndustry === 'all' ? undefined : selectedIndustry, selectedDifficulty === 'all' ? undefined : selectedDifficulty);

  const filteredSamples = samples.filter(sample =>
    sample.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sample.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApplySample = (sample: SampleContent) => {
    onApplySample(sample.content);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIndustryIcon = (industry: string) => {
    switch (industry) {
      case 'technology':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'marketing':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
          </svg>
        );
      case 'finance':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'healthcare':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        );
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Sample {section.charAt(0).toUpperCase() + section.slice(1)} Content
        </h3>
        
        {/* Search */}
        <div className="mb-3">
          <input
            type="text"
            placeholder="Search samples..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Industry:</label>
            <select
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Industries</option>
              {availableIndustries.map(ind => (
                <option key={ind} value={ind}>
                  {ind.charAt(0).toUpperCase() + ind.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Level:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex h-96">
        {/* Sample List */}
        <div className="w-1/2 border-r overflow-y-auto">
          {filteredSamples.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No samples found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredSamples.map((sample) => (
                <div
                  key={sample.id}
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedSample?.id === sample.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                  onClick={() => setSelectedSample(sample)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{sample.title}</h4>
                    <div className="flex items-center space-x-1">
                      {sample.industry && getIndustryIcon(sample.industry)}
                      <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(sample.difficulty)}`}>
                        {sample.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2">{sample.content.substring(0, 100)}...</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {sample.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sample Preview */}
        <div className="w-1/2 p-4">
          {selectedSample ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-gray-900">{selectedSample.title}</h4>
                <button
                  onClick={() => handleApplySample(selectedSample)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use This Sample
                </button>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center space-x-2 mb-2">
                  {selectedSample.industry && (
                    <div className="flex items-center space-x-1">
                      {getIndustryIcon(selectedSample.industry)}
                      <span className="text-sm text-gray-600 capitalize">{selectedSample.industry}</span>
                    </div>
                  )}
                  <span className={`text-sm px-2 py-1 rounded-full ${getDifficultyColor(selectedSample.difficulty)}`}>
                    {selectedSample.difficulty}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-3">
                  {selectedSample.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {selectedSample.content}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>Select a sample to preview</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Quick sample selector component
export const QuickSampleSelector: React.FC<{
  section: string;
  onApplySample: (content: string) => void;
  industry?: string;
  className?: string;
}> = ({ section, onApplySample, industry, className = '' }) => {
  const samples = getSampleContent(section, industry).slice(0, 3);

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="font-medium text-gray-900 text-sm">Quick Samples</h4>
      <div className="space-y-2">
        {samples.map((sample) => (
          <button
            key={sample.id}
            onClick={() => onApplySample(sample.content)}
            className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-medium text-gray-900 text-sm">{sample.title}</span>
              <span className="text-xs text-gray-500 capitalize">{sample.difficulty}</span>
            </div>
            <p className="text-xs text-gray-600 line-clamp-2">{sample.content.substring(0, 80)}...</p>
          </button>
        ))}
      </div>
    </div>
  );
};
