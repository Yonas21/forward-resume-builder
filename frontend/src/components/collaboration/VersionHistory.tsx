import React, { useState } from 'react';
import type { Version, VersionDiff } from '../../hooks/useVersionHistory';

interface VersionHistoryProps {
  versions: Version[];
  onRestoreVersion: (versionId: string) => Promise<any>;
  onCompareVersions: (versionAId: string, versionBId: string) => VersionDiff | null;
  onPublishVersion: (versionId: string) => Promise<void>;
  className?: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions, onRestoreVersion, onCompareVersions, onPublishVersion, className = ''
}) => {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([]);
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<VersionDiff | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'branches'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'version' | 'name'>('date');
  const [showBranchForm, setShowBranchForm] = useState(false);
  const [branchName, setBranchName] = useState('');
  const [selectedVersionForBranch, setSelectedVersionForBranch] = useState<string>('');

  const filteredVersions = versions.filter(v => {
    if (filter === 'published') return v.isPublished;
    if (filter === 'branches') return v.branchName;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'version':
        return b.versionNumber - a.versionNumber;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });

  const handleCompare = () => {
    if (selectedVersions.length === 2) {
      const diff = onCompareVersions(selectedVersions[0], selectedVersions[1]);
      setDiffResult(diff);
      setShowDiff(true);
    }
  };

  const handleRestore = async (versionId: string) => {
    try {
      await onRestoreVersion(versionId);
    } catch (error) {
      console.error('Failed to restore version:', error);
    }
  };

  const handleCreateBranch = async () => {
    if (!branchName.trim() || !selectedVersionForBranch) return;
    
    try {
      // For now, just close the form since onCreateBranch is not available
      setShowBranchForm(false);
      setBranchName('');
      setSelectedVersionForBranch('');
    } catch (error) {
      console.error('Failed to create branch:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added': return 'bg-green-100 text-green-800';
      case 'removed': return 'bg-red-100 text-red-800';
      case 'modified': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getBranchColor = (branchName: string) => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-purple-100 text-purple-800',
      'bg-orange-100 text-orange-800',
      'bg-pink-100 text-pink-800'
    ];
    const index = branchName.length % colors.length;
    return colors[index];
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header with compare button */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
            <p className="text-sm text-gray-600">Track changes and compare different versions of your resume</p>
          </div>
          <div className="flex items-center space-x-2">
            {selectedVersions.length === 2 && (
              <button
                onClick={handleCompare}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compare Selected
              </button>
            )}
            <button
              onClick={() => setShowBranchForm(true)}
              className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Create Branch
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{versions.length}</div>
            <div className="text-sm text-gray-600">Total Versions</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{versions.filter(v => v.isPublished).length}</div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{versions.filter(v => v.branchName).length}</div>
            <div className="text-sm text-gray-600">Branches</div>
          </div>
                     <div className="text-center">
             <div className="text-2xl font-bold text-orange-600">{versions.filter(v => v.isCurrent).length}</div>
             <div className="text-sm text-gray-600">Current</div>
           </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Versions</option>
              <option value="published">Published Only</option>
              <option value="branches">Branches Only</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="date">Date</option>
              <option value="version">Version Number</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Version List */}
      {filteredVersions.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No versions yet</h3>
          <p className="text-gray-600 mb-4">Start editing your resume to create version history</p>
        </div>
      ) : (
        <div className="divide-y">
          {filteredVersions.map((version) => (
            <div key={version.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{version.name}</h4>
                    <span className="text-sm text-gray-500">v{version.versionNumber}</span>
                    {version.isCurrent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Current
                      </span>
                    )}
                    {version.isPublished && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Published
                      </span>
                    )}
                    {version.branchName && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBranchColor(version.branchName)}`}>
                        {version.branchName}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">{version.description}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-3">
                    <span>Created by {version.createdByName}</span>
                    <span>{formatDate(version.createdAt)}</span>
                    <span>{version.diffStats.totalChanges} changes</span>
                  </div>

                  <div className="flex items-center space-x-2">
                                         <input
                       type="checkbox"
                       checked={selectedVersions.includes(version.id)}
                       onChange={(e) => {
                         if (e.target.checked) {
                           if (selectedVersions.length < 2) {
                             setSelectedVersions([...selectedVersions, version.id]);
                           }
                         } else {
                           setSelectedVersions(selectedVersions.filter(id => id !== version.id));
                         }
                       }}
                       className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                     />
                    <span className="text-xs text-gray-600">Select for comparison</span>
                  </div>

                  <div className="flex items-center space-x-2 mt-3">
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded hover:bg-blue-200 transition-colors"
                      >
                        Restore
                      </button>
                    )}
                    {!version.isPublished && (
                      <button
                        onClick={() => onPublishVersion(version.id)}
                        className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200 transition-colors"
                      >
                        Publish
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedVersionForBranch(version.id);
                        setShowBranchForm(true);
                      }}
                      className="px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded hover:bg-purple-200 transition-colors"
                    >
                      Branch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Branch Form */}
      {showBranchForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Create Branch</h3>
              <button
                onClick={() => setShowBranchForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g., job-application-v2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">From Version</label>
                  <select
                    value={selectedVersionForBranch}
                    onChange={(e) => setSelectedVersionForBranch(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select a version</option>
                    {versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.name} (v{version.versionNumber})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setShowBranchForm(false)}
                    className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateBranch}
                    disabled={!branchName.trim() || !selectedVersionForBranch}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Create Branch
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Version Comparison */}
      {showDiff && diffResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Version Comparison</h3>
              <button
                onClick={() => setShowDiff(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-6">
                                 {diffResult.changes.map((sectionDiff, index) => (
                   <div key={index} className="border rounded-lg p-4">
                     <h4 className="font-medium text-gray-900 mb-3">{sectionDiff.section}</h4>
                     <div className="space-y-2">
                       {sectionDiff.changes.map((change, changeIndex) => (
                         <div key={changeIndex} className="flex items-start space-x-2">
                           <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getChangeTypeColor(change.type)}`}>
                             {change.type}
                           </span>
                           <div className="flex-1 text-sm">
                             <div className="font-medium">{change.field}</div>
                             {change.oldValue && (
                               <div className="text-red-600 line-through">{change.oldValue}</div>
                             )}
                             {change.newValue && (
                               <div className="text-green-600">{change.newValue}</div>
                             )}
                           </div>
                         </div>
                       ))}
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
