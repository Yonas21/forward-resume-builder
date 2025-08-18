import React from 'react';
import { useAutoSave } from '../hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ className = '' }) => {
  const { isSaving, lastSaved, hasUnsavedChanges, saveError } = useAutoSave();

  const getStatusText = () => {
    if (saveError) return 'Save failed';
    if (isSaving) return 'Saving...';
    if (hasUnsavedChanges) return 'Unsaved changes';
    if (lastSaved) return `Saved ${lastSaved.toLocaleTimeString()}`;
    return 'All changes saved';
  };

  const getStatusColor = () => {
    if (saveError) return 'text-red-500';
    if (isSaving) return 'text-blue-500';
    if (hasUnsavedChanges) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getIcon = () => {
    if (saveError) return '⚠️';
    if (isSaving) return '⏳';
    if (hasUnsavedChanges) return '💾';
    return '✓';
  };

  return (
    <div className={`flex items-center space-x-2 text-sm ${className}`}>
      <span className={getStatusColor()}>{getIcon()}</span>
      <span className={getStatusColor()}>{getStatusText()}</span>
      {saveError && (
        <button
          onClick={() => window.location.reload()}
          className="text-xs text-red-600 hover:text-red-800 underline"
        >
          Retry
        </button>
      )}
    </div>
  );
};
