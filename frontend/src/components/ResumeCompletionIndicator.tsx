import React, { useMemo } from 'react';
import { useResumeStore } from '../store/resumeStore';

interface CompletionSection {
  name: string;
  weight: number;
  isComplete: boolean;
  suggestions: string[];
}

export const ResumeCompletionIndicator: React.FC<{
  className?: string;
  showDetails?: boolean;
}> = ({ className = '', showDetails = false }) => {
  const { resume } = useResumeStore();

  const completionData = useMemo(() => {
    if (!resume) return { percentage: 0, sections: [], suggestions: [] };

    const sections: CompletionSection[] = [
      {
        name: 'Personal Information',
        weight: 15,
        isComplete: Boolean(
          resume.personal_info?.full_name?.trim() &&
          resume.personal_info?.email?.trim() &&
          resume.personal_info?.phone?.trim()
        ),
        suggestions: [
          'Add your full name',
          'Include a professional email address',
          'Add your phone number',
          'Include your location'
        ]
      },
      {
        name: 'Professional Summary',
        weight: 20,
        isComplete: Boolean(resume.professional_summary?.trim() && resume.professional_summary.length > 50),
        suggestions: [
          'Write a compelling professional summary',
          'Highlight your key strengths and career objectives',
          'Keep it between 50-200 characters'
        ]
      },
      {
        name: 'Work Experience',
        weight: 30,
        isComplete: Boolean(resume.experience && resume.experience.length > 0),
        suggestions: [
          'Add at least one work experience entry',
          'Include job title, company, and dates',
          'Describe your responsibilities and achievements',
          'Use action verbs and quantify results'
        ]
      },
      {
        name: 'Education',
        weight: 15,
        isComplete: Boolean(resume.education && resume.education.length > 0),
        suggestions: [
          'Add your educational background',
          'Include degree, institution, and graduation date',
          'Add relevant coursework or achievements'
        ]
      },
      {
        name: 'Skills',
        weight: 20,
        isComplete: Boolean(resume.skills && resume.skills.length >= 3),
        suggestions: [
          'Add at least 3 relevant skills',
          'Include both technical and soft skills',
          'Categorize skills by proficiency level',
          'Match skills to your target job'
        ]
      }
    ];

    const completedWeight = sections
      .filter(section => section.isComplete)
      .reduce((sum, section) => sum + section.weight, 0);

    const percentage = Math.round(completedWeight);

    const incompleteSections = sections.filter(section => !section.isComplete);
    const suggestions = incompleteSections.flatMap(section => section.suggestions);

    return {
      percentage,
      sections,
      suggestions: suggestions.slice(0, 5) // Limit to 5 suggestions
    };
  }, [resume]);

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    if (percentage >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getProgressText = (percentage: number) => {
    if (percentage >= 80) return 'Excellent! Your resume is well-rounded';
    if (percentage >= 60) return 'Good progress! A few more details will make it great';
    if (percentage >= 40) return 'Getting there! Add more sections to strengthen your resume';
    return 'Getting started! Add your basic information to begin';
  };

  if (!resume) return null;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-900">Resume Completion</h3>
        <span className="text-sm font-semibold text-gray-700">
          {completionData.percentage}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(completionData.percentage)}`}
          style={{ width: `${completionData.percentage}%` }}
        />
      </div>

      {/* Progress Text */}
      <p className="text-xs text-gray-600 mb-3">
        {getProgressText(completionData.percentage)}
      </p>

      {/* Section Details */}
      {showDetails && (
        <div className="space-y-2">
          {completionData.sections.map((section, index) => (
            <div key={index} className="flex items-center justify-between text-xs">
              <span className="text-gray-700">{section.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">{section.weight}%</span>
                {section.isComplete ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-gray-400">○</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Suggestions */}
      {completionData.suggestions.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Suggestions to improve:</h4>
          <ul className="space-y-1">
            {completionData.suggestions.map((suggestion, index) => (
              <li key={index} className="text-xs text-gray-600 flex items-start">
                <span className="text-blue-500 mr-1">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Quick Actions */}
      {completionData.percentage < 100 && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <h4 className="text-xs font-medium text-gray-700 mb-2">Quick Actions:</h4>
          <div className="flex flex-wrap gap-2">
            {!completionData.sections[0].isComplete && (
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                Add Personal Info
              </button>
            )}
            {!completionData.sections[2].isComplete && (
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                Add Experience
              </button>
            )}
            {!completionData.sections[4].isComplete && (
              <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
                Add Skills
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Compact version for headers or sidebars
export const CompactCompletionIndicator: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { resume } = useResumeStore();

  const completionPercentage = useMemo(() => {
    if (!resume) return 0;

    const checks = [
      Boolean(resume.personal_info?.full_name?.trim()),
      Boolean(resume.personal_info?.email?.trim()),
      Boolean(resume.personal_info?.phone?.trim()),
      Boolean(resume.professional_summary?.trim() && resume.professional_summary.length > 50),
      Boolean(resume.experience && resume.experience.length > 0),
      Boolean(resume.education && resume.education.length > 0),
      Boolean(resume.skills && resume.skills.length >= 3)
    ];

    const completedChecks = checks.filter(Boolean).length;
    return Math.round((completedChecks / checks.length) * 100);
  }, [resume]);

  if (!resume) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-16 bg-gray-200 rounded-full h-1.5">
        <div
          className={`h-1.5 rounded-full transition-all duration-500 ${
            completionPercentage >= 80 ? 'bg-green-500' :
            completionPercentage >= 60 ? 'bg-yellow-500' :
            completionPercentage >= 40 ? 'bg-orange-500' : 'bg-red-500'
          }`}
          style={{ width: `${completionPercentage}%` }}
        />
      </div>
      <span className="text-xs text-gray-600 font-medium">
        {completionPercentage}%
      </span>
    </div>
  );
};
