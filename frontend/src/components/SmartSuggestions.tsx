import React, { useState } from 'react';
import type { JobSuggestion } from '../hooks/useSmartSuggestions';

interface SmartSuggestionsProps {
  suggestions: JobSuggestion[];
  onSelectSuggestion: (suggestion: JobSuggestion) => void;
  onApplySuggestions: (suggestions: JobSuggestion[]) => void;
  selectedSuggestions: string[];
  className?: string;
}

export const SmartSuggestions: React.FC<SmartSuggestionsProps> = ({
  suggestions,
  onSelectSuggestion,
  onApplySuggestions,
  selectedSuggestions,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'skill' | 'achievement' | 'keyword' | 'template' | 'section'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'category' | 'source'>('relevance');

  const filteredSuggestions = suggestions.filter(suggestion => 
    filter === 'all' || suggestion.category === filter
  );

  const sortedSuggestions = [...filteredSuggestions].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        return b.relevance - a.relevance;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'source':
        return a.source.localeCompare(b.source);
      default:
        return 0;
    }
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'skill':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        );
      case 'achievement':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        );
      case 'keyword':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        );
      case 'template':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        );
      case 'section':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        );
      default:
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'industry':
        return 'bg-blue-100 text-blue-800';
      case 'job-title':
        return 'bg-green-100 text-green-800';
      case 'common':
        return 'bg-gray-100 text-gray-800';
      case 'ai':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'text-green-600';
    if (relevance >= 60) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const selectedSuggestionsList = suggestions.filter(s => selectedSuggestions.includes(s.id));

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Smart Suggestions</h3>
          <span className="text-sm text-gray-500">
            {suggestions.length} suggestions available
          </span>
        </div>

        {/* Filters and Sort */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="skill">Skills</option>
              <option value="achievement">Achievements</option>
              <option value="keyword">Keywords</option>
              <option value="template">Templates</option>
              <option value="section">Sections</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="relevance">Relevance</option>
              <option value="category">Category</option>
              <option value="source">Source</option>
            </select>
          </div>
        </div>
      </div>

      {/* Selected Suggestions */}
      {selectedSuggestionsList.length > 0 && (
        <div className="p-4 bg-blue-50 border-b">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-blue-900">
              Selected ({selectedSuggestionsList.length})
            </h4>
            <button
              onClick={() => onApplySuggestions(selectedSuggestionsList)}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              Apply Selected
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedSuggestionsList.map((suggestion) => (
              <span
                key={suggestion.id}
                className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {suggestion.title}
                <button
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="max-h-96 overflow-y-auto">
        {sortedSuggestions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <p>No suggestions available for the current filter</p>
          </div>
        ) : (
          <div className="divide-y">
            {sortedSuggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedSuggestions.includes(suggestion.id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => onSelectSuggestion(suggestion)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getCategoryIcon(suggestion.category)}
                      <h4 className="font-medium text-gray-900">{suggestion.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getSourceColor(suggestion.source)}`}>
                        {suggestion.source}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="capitalize">{suggestion.category}</span>
                      <span className={`font-medium ${getRelevanceColor(suggestion.relevance)}`}>
                        {suggestion.relevance}% relevant
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={selectedSuggestions.includes(suggestion.id)}
                      onChange={() => onSelectSuggestion(suggestion)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Quick suggestion chips component
export const SuggestionChips: React.FC<{
  suggestions: JobSuggestion[];
  onSelectSuggestion: (suggestion: JobSuggestion) => void;
  maxChips?: number;
  className?: string;
}> = ({ suggestions, onSelectSuggestion, maxChips = 5, className = '' }) => {
  const topSuggestions = suggestions
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, maxChips);

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {topSuggestions.map((suggestion) => (
        <button
          key={suggestion.id}
          onClick={() => onSelectSuggestion(suggestion)}
          className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
          title={suggestion.description}
        >
          {suggestion.title}
          <span className="ml-1 text-xs opacity-75">({suggestion.relevance}%)</span>
        </button>
      ))}
    </div>
  );
};
