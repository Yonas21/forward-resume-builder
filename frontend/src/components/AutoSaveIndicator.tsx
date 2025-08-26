import React from 'react';
import { useAutoSave } from '../hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  className?: string;
  showProgress?: boolean;
  showDetails?: boolean;
  compact?: boolean;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ 
  className = '', 
  showProgress = true,
  showDetails = true,
  compact = false
}) => {
  const { 
    isSaving, 
    lastSaved, 
    hasUnsavedChanges, 
    saveError, 
    forceSave
  } = useAutoSave();

  // Determine status based on available state
  const getStatus = () => {
    if (isSaving) return 'saving';
    if (saveError) return 'error';
    if (hasUnsavedChanges) return 'unsaved';
    if (lastSaved) return 'saved';
    return 'idle';
  };

  const getSaveStatusText = () => {
    const status = getStatus();
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      case 'unsaved':
        return 'Unsaved changes';
      case 'saved':
        return 'All changes saved';
      default:
        return 'Ready';
    }
  };

  const status = getStatus();

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'text-blue-500';
      case 'error':
        return 'text-red-500';
      case 'unsaved':
        return 'text-yellow-500';
      case 'saved':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        );
      case 'error':
        return '⚠️';
      case 'unsaved':
        return '💾';
      case 'saved':
        return '✓';
      default:
        return '○';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'saving':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'unsaved':
        return 'bg-yellow-50 border-yellow-200';
      case 'saved':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <span className={getStatusColor()}>{getStatusIcon()}</span>
        <span className={getStatusColor()}>
          {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved' : 'Unsaved'}
        </span>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm p-3 ${getStatusBgColor()} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className={getStatusColor()}>{getStatusIcon()}</span>
          <div>
            <p className={`text-sm font-medium ${getStatusColor()}`}>
              {getSaveStatusText()}
            </p>
            {showDetails && (
              <p className="text-xs text-gray-500">
                {lastSaved ? `Last saved: ${lastSaved.toLocaleTimeString()}` : 'No saves yet'}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {status === 'error' && (
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          )}
          
          {hasUnsavedChanges && !isSaving && (
            <button
              onClick={forceSave}
              className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Save Now
            </button>
          )}
        </div>
      </div>

      {showProgress && isSaving && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 rounded-full h-1">
            <div className="bg-blue-600 h-1 rounded-full transition-all duration-300 animate-pulse" />
          </div>
        </div>
      )}

      {saveError && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
          {saveError}
        </div>
      )}
    </div>
  );
};

// Floating auto-save indicator for less intrusive display
export const FloatingAutoSaveIndicator: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { isSaving, hasUnsavedChanges, saveError } = useAutoSave();
  
  // Determine status based on available state
  const getStatus = () => {
    if (isSaving) return 'saving';
    if (saveError) return 'error';
    if (hasUnsavedChanges) return 'unsaved';
    return 'idle';
  };
  
  const status = getStatus();
  
  if (status === 'idle' || status === 'saved') return null;

  const getIndicatorColor = () => {
    switch (status) {
      case 'saving':
        return 'bg-blue-500';
      case 'error':
        return 'bg-red-500';
      case 'unsaved':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getIndicatorText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      case 'unsaved':
        return 'Unsaved';
      default:
        return '';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-40 ${className}`}>
      <div className={`${getIndicatorColor()} text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium`}>
        {getIndicatorText()}
      </div>
    </div>
  );
};

// Auto-save status bar for the bottom of the screen
export const AutoSaveStatusBar: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { 
    isSaving, 
    hasUnsavedChanges, 
    saveError, 
    forceSave
  } = useAutoSave();

  // Determine status based on available state
  const getStatus = () => {
    if (isSaving) return 'saving';
    if (saveError) return 'error';
    if (hasUnsavedChanges) return 'unsaved';
    return 'idle';
  };

  const getSaveStatusText = () => {
    const status = getStatus();
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'error':
        return 'Save failed';
      case 'unsaved':
        return 'Unsaved changes';
      default:
        return 'Ready';
    }
  };

  const status = getStatus();

  if (status === 'idle') return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 px-4 py-2 ${className}`}>
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-600">
            {getSaveStatusText()}
          </span>
          
          {isSaving && (
            <div className="w-32 bg-gray-200 rounded-full h-1">
              <div className="bg-blue-600 h-1 rounded-full transition-all duration-300 animate-pulse" />
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {saveError && (
            <button
              onClick={() => window.location.reload()}
              className="text-xs text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          )}
          
          {hasUnsavedChanges && !isSaving && (
            <button
              onClick={forceSave}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors"
            >
              Save Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
