import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { useResumeStore } from '../store/resumeStore';
import { jobService } from '../services/jobService';
import type { JobPosting, JobSearchRequest } from '../services/jobService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { MagnifyingGlassIcon, FunnelIcon, MapPinIcon, BriefcaseIcon, CurrencyDollarIcon, CalendarIcon, StarIcon, ArrowTopRightOnSquareIcon, ChartBarIcon, BuildingOfficeIcon, ClockIcon } from '@heroicons/react/24/outline';

interface JobFilters {
  location: string;
  remote: boolean;
  min_salary?: number;
  max_salary?: number;
  job_type: string;
  experience_level: string;
}

const JobSearch: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore();
  const { resume } = useResumeStore();
  
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [newSkill, setNewSkill] = useState('');
  const [filters, setFilters] = useState<JobFilters>({
    location: '',
    remote: true,
    job_type: '',
    experience_level: ''
  });
  const [sortBy, setSortBy] = useState<'match_score' | 'posted_date' | 'salary' | 'company'>('match_score');
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode] = useState<'manual' | 'resume'>('resume');
  
  // State for managing skill priority order
  const [skillPriority, setSkillPriority] = useState<string[]>([]);

  // Get skills from resume or search query, with priority order
  const searchSkills = useMemo(() => {
    let baseSkills: string[] = [];
    
    if (searchMode === 'resume' && resume?.skills) {
      baseSkills = resume.skills.map(skill => typeof skill === 'string' ? skill : skill.name);
    } else if (searchQuery.trim()) {
      baseSkills = searchQuery.split(',').map(skill => skill.trim()).filter(Boolean);
    }
    
    // Use priority order if set, otherwise use base order
    if (skillPriority.length > 0 && skillPriority.length === baseSkills.length) {
      return skillPriority;
    }
    
    return baseSkills;
  }, [searchMode, resume?.skills, searchQuery, skillPriority]);

  // Filter and sort jobs
  const filteredAndSortedJobs = useMemo(() => {
    console.log('Jobs before filtering:', jobs.length, jobs);
    console.log('Current filters:', filters);
    
    // For now, return all jobs without filtering to debug
    console.log('Returning all jobs:', jobs.length);
    return jobs;
  }, [jobs, filters, sortBy]);

  const searchJobs = async () => {
    if (!searchSkills.length) {
      setError('Please enter skills or use resume mode');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let response;
      if (searchMode === 'resume') {
        response = await jobService.searchJobsByResume(
          filters.location || undefined,
          filters.remote,
          50,
          filters.min_salary,
          filters.max_salary
        );
      } else {
        response = await jobService.searchJobsGet(
          searchSkills.join(','),
          filters.location || undefined,
          filters.remote,
          50,
          filters.min_salary,
          filters.max_salary,
          filters.job_type || undefined,
          filters.experience_level || undefined
        );
      }
      console.log('filtered', response.jobs);

      setJobs(response.jobs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search jobs');
    } finally {
      setLoading(false);
    }
  };

  // Initial search on mount if authenticated and in resume mode
  useEffect(() => {
    if (isAuthenticated && searchMode === 'resume' && resume?.skills?.length) {
      searchJobs();
    }
  }, [isAuthenticated, resume?.skills, searchMode]);

  const handleFilterChange = (key: keyof JobFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      remote: true,
      job_type: '',
      experience_level: ''
    });
  };

  const addSkill = () => {
    if (newSkill.trim() && !searchSkills.includes(newSkill.trim())) {
      if (searchMode === 'resume') {
        // In resume mode, we need to switch to manual mode to add custom skills
        setSearchQuery(prev => prev ? `${prev}, ${newSkill.trim()}` : newSkill.trim());
      } else {
        setSearchQuery(prev => prev ? `${prev}, ${newSkill.trim()}` : newSkill.trim());
      }
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    if (searchMode === 'resume') {
      // In resume mode, we can't remove resume skills, but we can add custom ones
      return;
    }
    const skills = searchQuery.split(',').map(s => s.trim()).filter(Boolean);
    skills.splice(index, 1);
    setSearchQuery(skills.join(', '));
  };

  const handleApplyToJob = (job: JobPosting) => {
    // Open the job application URL in a new tab
    if (job.application_url) {
      window.open(job.application_url, '_blank', 'noopener,noreferrer');
    } else {
      // If no URL, show a message or copy job details
      alert(`Application submitted for ${job.title} at ${job.company}!`);
    }
  };

  // Drag and drop functionality for skill priority
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Reorder skills
    const newSkills = [...searchSkills];
    const [draggedSkill] = newSkills.splice(draggedIndex, 1);
    newSkills.splice(dropIndex, 0, draggedSkill);

    // Update the priority order state
    setSkillPriority(newSkills);
    
    // Also update search query for manual mode
    if (searchMode === 'manual') {
      setSearchQuery(newSkills.join(', '));
    }
    
    setDraggedIndex(null);
  };

  const resetSkillPriority = () => {
    // Clear the priority order to use original order
    setSkillPriority([]);
    
    if (searchMode === 'manual') {
      // Reset to alphabetical order for manual mode
      const sortedSkills = [...searchSkills].sort();
      setSearchQuery(sortedSkills.join(', '));
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Poor Match';
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Search Jobs</h2>
          <p className="text-gray-600">Please sign in to access job search features and get personalized job recommendations.</p>
        </div>
      </div>
    );
  }

  // Debug logging
  console.log('Component render - jobs:', jobs.length, 'filteredAndSortedJobs:', filteredAndSortedJobs.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Search</h1>
              <p className="mt-2 text-gray-600">
                Find jobs that match your skills and experience
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Mode Toggle */}
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setNewSkill('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  searchMode === 'resume'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Use Resume Skills
              </button>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setNewSkill('');
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  searchMode === 'manual'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Manual Search
              </button>
            </div>

            {/* Search Input */}
            {searchMode === 'manual' && (
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Enter skills (e.g., React, Python, AWS)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={searchJobs}
              disabled={loading || (!searchSkills.length)}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <LoadingSpinner size="sm" /> : <MagnifyingGlassIcon className="h-4 w-4" />}
              <span className="ml-2">
                Search Jobs
                {searchSkills.length > 0 && (
                  <span className="text-xs ml-1 opacity-75">
                    ({searchSkills.length} skills)
                  </span>
                )}
              </span>
            </button>
          </div>

          {/* Skills Display */}
          {searchSkills.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm text-gray-600">Searching for jobs matching these skills:</p>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {searchSkills.length} skill{searchSkills.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {/* Resume Skills */}
                {searchMode === 'resume' && resume?.skills && resume.skills.map((skill, index) => (
                  <span
                    key={`resume-${index}`}
                    className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    title="From your resume"
                  >
                    {typeof skill === 'string' ? skill : skill.name}
                    <span className="ml-2 text-green-600 text-xs">📄</span>
                  </span>
                ))}
                
                {/* Manual Skills */}
                {searchQuery && searchQuery.split(',').map((skill, index) => {
                  const trimmedSkill = skill.trim();
                  if (!trimmedSkill) return null;
                  
                  return (
                    <span
                      key={`manual-${index}`}
                      className="inline-flex items-center px-3 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {trimmedSkill}
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-blue-600 hover:text-blue-800 font-bold"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Add Skill Input */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                Total skills: {searchSkills.length} 
                {searchMode === 'resume' && resume?.skills && (
                  <span className="text-green-600"> (Resume: {resume.skills.length})</span>
                )}
                {searchQuery && (
                  <span className="text-blue-600"> (Custom: {searchQuery.split(',').filter(s => s.trim()).length})</span>
                )}
              </span>
            </div>
            
            {/* Skill Priority Management */}
            <div className="mb-3 p-3 bg-gray-50 rounded-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Skill Priority (drag to reorder)</span>
                  <span className="text-xs text-gray-500">Higher priority = Better job matches</span>
                  {skillPriority.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Custom Order
                    </span>
                  )}
                </div>
                <button
                  onClick={resetSkillPriority}
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  disabled={skillPriority.length === 0}
                >
                  Reset Order
                </button>
              </div>
              <div className="text-xs text-gray-600 mb-2 italic">
                💡 Drag skills to reorder them by priority. Skills at the top get better job matches!
              </div>
              <div className="flex flex-wrap gap-2">
                {searchSkills.map((skill, index) => (
                  <div
                    key={`priority-${index}`}
                    className={`flex items-center gap-1 px-3 py-2 rounded-full text-sm font-medium bg-white border border-gray-200 shadow-sm cursor-move hover:shadow-md transition-all ${
                      draggedIndex === index ? 'opacity-50 scale-95' : ''
                    } ${index === 0 ? 'ring-2 ring-blue-200' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <span className={`text-xs mr-1 font-bold ${
                      index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : index === 2 ? 'text-yellow-600' : 'text-gray-500'
                    }`}>
                      #{index + 1}
                    </span>
                    <span className="text-gray-700">{skill}</span>
                    {searchMode === 'manual' && (
                      <button
                        onClick={() => removeSkill(index)}
                        className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a skill (e.g., React, Python)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <button
                onClick={addSkill}
                disabled={!newSkill.trim()}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                Add Skill
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="City, State"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Remote</label>
                <select
                  value={filters.remote.toString()}
                  onChange={(e) => handleFilterChange('remote', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="true">Remote Only</option>
                  <option value="false">On-site Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <select
                  value={filters.job_type}
                  onChange={(e) => handleFilterChange('job_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Types</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <select
                  value={filters.experience_level}
                  onChange={(e) => handleFilterChange('experience_level', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Levels</option>
                  <option value="Entry">Entry</option>
                  <option value="Mid-level">Mid-level</option>
                  <option value="Senior">Senior</option>
                  <option value="Lead">Lead</option>
                  <option value="Principal">Principal</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 flex justify-between">
              <button
                onClick={resetFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Reset Filters
              </button>
            </div>
          </div>
        )}

        {/* Debug Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="text-sm text-blue-800">
            <p><strong>Debug Info:</strong></p>
            <p>Jobs fetched: {jobs.length}</p>
            <p>Skills being used: {searchSkills.length}</p>
            <p>Search mode: {searchMode}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center justify-between">
              <p className="text-red-800">{error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

                  {/* Results Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">
                  {loading ? 'Searching...' : `Found ${filteredAndSortedJobs.length} jobs`}
                </h3>
                <div className="text-sm text-gray-500">
                  Raw jobs: {jobs.length} | Filtered: {filteredAndSortedJobs.length}
                </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="match_score">Match Score</option>
                  <option value="posted_date">Posted Date</option>
                  <option value="salary">Salary</option>
                  <option value="company">Company</option>
                </select>
              </div>
            </div>
          </div>

          {/* Job Listings */}
          <div className="divide-y divide-gray-200">
            {filteredAndSortedJobs.map((job) => (
              <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-semibold text-gray-900">{job.title}</h4>
                      {job.match_score && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(job.match_score)}`}>
                          {job.match_score.toFixed(0)}% Match
                        </span>
                      )}
                    </div>
                    
                                          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          {job.company}
                        </div>
                        <div className="flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1" />
                          {job.location}
                        </div>
                        <div className="flex items-center">
                          <BriefcaseIcon className="h-4 w-4 mr-1" />
                          {job.job_type}
                        </div>
                        <div className="flex items-center">
                          <ChartBarIcon className="h-4 w-4 mr-1" />
                          {job.experience_level}
                        </div>
                      {job.remote && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Remote
                        </span>
                      )}
                    </div>

                    <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        {job.salary_range && (
                          <div className="flex items-center">
                            <CurrencyDollarIcon className="h-4 w-4 mr-1" />
                            {job.salary_range}
                          </div>
                        )}
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {new Date(job.posted_date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <StarIcon className="h-4 w-4 mr-1" />
                          {job.source}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleApplyToJob(job)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4 mr-2" />
                        Apply
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {!loading && filteredAndSortedJobs.length === 0 && jobs.length > 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No jobs match your current filters. Try adjusting your search criteria.</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && jobs.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              <p>No jobs found. Try searching with different skills or filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
