import { useState, useEffect, useCallback, useRef } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { resumeService } from '../services/resumeService';

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
  saveProgress: number;
  lastSaveAttempt: Date | null;
  saveCount: number;
}

export interface AutoSaveConfig {
  enabled?: boolean;
  debounceMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  showNotifications?: boolean;
}

export const useAutoSave = (config: AutoSaveConfig = {}) => {
  const {
    enabled = true,
    debounceMs = 2000,
    maxRetries = 3,
    retryDelayMs = 1000,
    showNotifications = true
  } = config;

  const { resume } = useResumeStore();
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null,
    saveProgress: 0,
    lastSaveAttempt: null,
    saveCount: 0
  });

  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const lastResumeRef = useRef(resume);

  // Detect changes in resume data
  useEffect(() => {
    if (!enabled || !resume) return;

    const hasChanged = JSON.stringify(resume) !== JSON.stringify(lastResumeRef.current);
    
    if (hasChanged) {
      setState(prev => ({ ...prev, hasUnsavedChanges: true, saveError: null }));
      lastResumeRef.current = resume;
      
      // Clear existing debounce
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      // Set new debounce
      debounceRef.current = setTimeout(() => {
        saveResume();
      }, debounceMs);
    }

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [resume, enabled, debounceMs]);

  const saveResume = useCallback(async () => {
    if (!enabled || !resume || state.isSaving) return;

    setState(prev => ({ 
      ...prev, 
      isSaving: true, 
      saveProgress: 0,
      lastSaveAttempt: new Date()
    }));

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setState(prev => ({
          ...prev,
          saveProgress: Math.min(prev.saveProgress + 10, 90)
        }));
      }, 100);

      await resumeService.saveResume(resume);
      
      clearInterval(progressInterval);
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        hasUnsavedChanges: false,
        lastSaved: new Date(),
        saveProgress: 100,
        saveError: null,
        saveCount: prev.saveCount + 1,
        retryCount: 0
      }));

      retryCountRef.current = 0;

      // Show success notification
      if (showNotifications) {
        showSaveNotification('Resume saved successfully', 'success');
      }

    } catch (error) {
      clearInterval(progressInterval);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to save resume';
      
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: errorMessage,
        saveProgress: 0
      }));

      // Retry logic
      if (retryCountRef.current < maxRetries) {
        retryCountRef.current++;
        
        setTimeout(() => {
          saveResume();
        }, retryDelayMs * retryCountRef.current);
      } else {
        // Show error notification after max retries
        if (showNotifications) {
          showSaveNotification(`Failed to save: ${errorMessage}`, 'error');
        }
      }
    }
  }, [resume, enabled, state.isSaving, maxRetries, retryDelayMs, showNotifications]);

  const showSaveNotification = useCallback((message: string, type: 'success' | 'error') => {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.classList.remove('translate-x-full');
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('translate-x-full');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }, []);

  const forceSave = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    saveResume();
  }, [saveResume]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, saveError: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      saveError: null,
      saveProgress: 0,
      lastSaveAttempt: null,
      saveCount: 0
    });
    retryCountRef.current = 0;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const getSaveStatus = useCallback(() => {
    if (state.isSaving) return 'saving';
    if (state.saveError) return 'error';
    if (state.hasUnsavedChanges) return 'unsaved';
    if (state.lastSaved) return 'saved';
    return 'idle';
  }, [state]);

  const getSaveStatusText = useCallback(() => {
    const status = getSaveStatus();
    switch (status) {
      case 'saving':
        return `Saving... ${state.saveProgress}%`;
      case 'error':
        return `Save failed: ${state.saveError}`;
      case 'unsaved':
        return 'Unsaved changes';
      case 'saved':
        return `Saved ${state.lastSaved?.toLocaleTimeString()}`;
      default:
        return 'All changes saved';
    }
  }, [state, getSaveStatus]);

  return {
    // State
    ...state,
    
    // Actions
    saveResume,
    forceSave,
    clearError,
    reset,
    
    // Computed
    getSaveStatus,
    getSaveStatusText,
    
    // Configuration
    config: { enabled, debounceMs, maxRetries, retryDelayMs, showNotifications }
  };
};
