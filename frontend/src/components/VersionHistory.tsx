import React, { useState } from 'react';
import { Version, VersionDiff, SectionDiff, FieldChange } from '../hooks/useVersionHistory';

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: Version | null;
  onRestoreVersion: (versionId: string) => Promise<any>;
  onCompareVersions: (versionAId: string, versionBId: string) => VersionDiff | null;
  onPublishVersion: (versionId: string) => Promise<void>;
  onCreateBranch: (versionId: string, branchName: string) => Promise<Version>;
  isLoading?: boolean;
  className?: string;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({
  versions,
  currentVersion,
  onRestoreVersion,
  onCompareVersions,
  onPublishVersion,
  onCreateBranch,
  isLoading = false,
  className = ''
}) => {
  const [selectedVersions, setSelectedVersions] = useState<[string, string] | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffResult, setDiffResult] = useState<VersionDiff | null>(null);
  const [filter, setFilter] = useState<'all' | 'published' | 'branches'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'version' | 'name'>('date');

  const filteredVersions = versions.filter(v => {
    if (filter === 'published') return v.isPublished;
    if (filter === 'branches') return v.branchName && v.branchName !== 'main';
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
    if (!selectedVersions) return;
    
    const diff = onCompareVersions(selectedVersions[0], selectedVersions[1]);
    setDiffResult(diff);
    setShowDiff(true);
  };

  const handleRestore = async (versionId: string) => {
    try {
      await onRestoreVersion(versionId);
    } catch (error) {
      console.error('Error restoring version:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case 'added':
        return 'bg-green-100 text-green-800';
      case 'modified':
        return 'bg-yellow-100 text-yellow-800';
      case 'removed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getBranchColor = (branchName: string) => {
    if (branchName === 'main') return 'bg-blue-100 text-blue-800';
    return 'bg-purple-100 text-purple-800';
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <div className="flex items-center space-x-2">
            {selectedVersions && (
              <button
                onClick={handleCompare}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Compare Selected
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Versions</option>
              <option value="published">Published</option>
              <option value="branches">Branches</option>
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
              <option value="version">Version</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Version List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredVersions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>No versions available</p>
            <p className="text-sm">Start editing to create versions</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredVersions.map((version) => (
              <div key={version.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{version.name}</h4>
                      {version.isCurrent && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Current
                        </span>
                      )}
                      {version.isPublished && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
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

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>v{version.versionNumber}</span>
                      <span>By {version.createdByName}</span>
                      <span>{formatDate(version.createdAt)}</span>
                      <span>{version.diffStats.totalChanges} changes</span>
                    </div>

                    {version.diffStats.totalChanges > 0 && (
                      <div className="flex items-center space-x-2 mt-2">
                        {version.diffStats.sectionsAdded > 0 && (
                          <span className="text-xs text-green-600">+{version.diffStats.sectionsAdded} added</span>
                        )}
                        {version.diffStats.sectionsModified > 0 && (
                          <span className="text-xs text-yellow-600">~{version.diffStats.sectionsModified} modified</span>
                        )}
                        {version.diffStats.sectionsRemoved > 0 && (
                          <span className="text-xs text-red-600">-{version.diffStats.sectionsRemoved} removed</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <input
                      type="checkbox"
                      checked={selectedVersions?.includes(version.id) || false}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (!selectedVersions) {
                            setSelectedVersions([version.id, '']);
                          } else if (selectedVersions[1] === '') {
                            setSelectedVersions([selectedVersions[0], version.id]);
                          } else {
                            setSelectedVersions([version.id, '']);
                          }
                        } else {
                          setSelectedVersions(null);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    
                    {!version.isCurrent && (
                      <button
                        onClick={() => handleRestore(version.id)}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                        title="Restore this version"
                      >
                        Restore
                      </button>
                    )}
                    
                    {!version.isPublished && (
                      <button
                        onClick={() => onPublishVersion(version.id)}
                        className="px-2 py-1 text-xs text-green-600 hover:text-green-800 transition-colors"
                        title="Publish this version"
                      >
                        Publish
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version Comparison */}
      {showDiff && diffResult && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">
              Comparing v{diffResult.versionA.versionNumber} vs v{diffResult.versionB.versionNumber}
            </h4>
            <button
              onClick={() => setShowDiff(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Summary */}
          <div className="mb-4 p-3 bg-white rounded-lg border">
            <h5 className="font-medium text-gray-900 mb-2">Summary</h5>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">+{diffResult.summary.sectionsAdded} added</span>
              <span className="text-yellow-600">~{diffResult.summary.sectionsModified} modified</span>
              <span className="text-red-600">-{diffResult.summary.sectionsRemoved} removed</span>
              <span className="text-gray-600">{diffResult.summary.totalChanges} total changes</span>
            </div>
          </div>

          {/* Changes */}
          <div className="space-y-3">
            {diffResult.changes.map((change, index) => (
              <div key={index} className="bg-white rounded-lg border p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getChangeTypeColor(change.type)}`}>
                    {change.type}
                  </span>
                  <span className="font-medium text-gray-900">{change.section}</span>
                </div>

                {change.changes.length > 0 && (
                  <div className="space-y-1">
                    {change.changes.map((fieldChange, fieldIndex) => (
                      <div key={fieldIndex} className="text-xs text-gray-600">
                        <span className={`inline-block px-1 rounded ${getChangeTypeColor(fieldChange.type)}`}>
                          {fieldChange.type}
                        </span>
                        <span className="ml-1">{fieldChange.field}</span>
                        {fieldChange.oldValue && (
                          <span className="ml-2 text-red-600">- {String(fieldChange.oldValue)}</span>
                        )}
                        {fieldChange.newValue && (
                          <span className="ml-2 text-green-600">+ {String(fieldChange.newValue)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
