import { useEffect, useRef, useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { resumeService } from '../services/resumeService';

interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  saveError: string | null;
}

export const useAutoSave = (debounceMs: number = 2000) => {
  const { resume } = useResumeStore();
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    saveError: null,
  });

  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastResumeRef = useRef(JSON.stringify(resume));

  const saveResume = async () => {
    if (state.isSaving) return;

    setState(prev => ({ ...prev, isSaving: true, saveError: null }));

    try {
      await resumeService.updateResume(resume);
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        saveError: null,
      }));
    } catch (error) {
      console.error('Auto-save failed:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        saveError: error instanceof Error ? error.message : 'Failed to save',
      }));
    }
  };

  useEffect(() => {
    const currentResume = JSON.stringify(resume);
    
    if (currentResume !== lastResumeRef.current) {
      lastResumeRef.current = currentResume;
      setState(prev => ({ ...prev, hasUnsavedChanges: true }));

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      saveTimeoutRef.current = setTimeout(() => {
        saveResume();
      }, debounceMs);
    }

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [resume, debounceMs]);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  const forceSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    return saveResume();
  };

  return {
    ...state,
    forceSave,
  };
};
