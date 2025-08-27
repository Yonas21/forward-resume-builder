import { useState, useCallback, useRef, useEffect } from 'react';
import type { Resume } from '../types';

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  resume: Resume;
  description: string;
  action: string;
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  history: HistoryEntry[];
  currentIndex: number;
  maxEntries: number;
}

export interface UndoRedoConfig {
  maxEntries?: number;
  debounceMs?: number;
  autoSave?: boolean;
}

export const useUndoRedo = (config: UndoRedoConfig = {}) => {
  const {
    maxEntries = 50,
    debounceMs = 1000,
    autoSave = true
  } = config;

  const [state, setState] = useState<UndoRedoState>({
    canUndo: false,
    canRedo: false,
    history: [],
    currentIndex: -1,
    maxEntries
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastResumeRef = useRef<Resume | null>(null);
  const isUndoRedoActionRef = useRef(false);

  // Update undo/redo state
  const updateState = useCallback((newState: Partial<UndoRedoState>) => {
    setState(prev => {
      const updated = { ...prev, ...newState };
      return {
        ...updated,
        canUndo: updated.currentIndex > 0,
        canRedo: updated.currentIndex < updated.history.length - 1
      };
    });
  }, []);

  // Add entry to history
  const addEntry = useCallback((resume: Resume, description: string, action: string) => {
    if (isUndoRedoActionRef.current) {
      isUndoRedoActionRef.current = false;
      return;
    }

    const entry: HistoryEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      resume: JSON.parse(JSON.stringify(resume)), // Deep clone
      description,
      action
    };

    setState(prev => {
      // Remove any entries after current index (for redo)
      const newHistory = prev.history.slice(0, prev.currentIndex + 1);
      
      // Add new entry
      newHistory.push(entry);
      
      // Remove oldest entries if exceeding max
      if (newHistory.length > maxEntries) {
        newHistory.splice(0, newHistory.length - maxEntries);
      }
      
      const newIndex = newHistory.length - 1;
      
      return {
        history: newHistory,
        currentIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: false,
        maxEntries
      };
    });
  }, [maxEntries]);

  // Undo action
  const undo = useCallback(() => {
    if (!state.canUndo) return;

    isUndoRedoActionRef.current = true;
    
    const newIndex = state.currentIndex - 1;
    const entry = state.history[newIndex];
    
    if (entry) {
      updateState({ currentIndex: newIndex });
      return entry.resume;
    }
    
    return null;
  }, [state.canUndo, state.currentIndex, state.history, updateState]);

  // Redo action
  const redo = useCallback(() => {
    if (!state.canRedo) return;

    isUndoRedoActionRef.current = true;
    
    const newIndex = state.currentIndex + 1;
    const entry = state.history[newIndex];
    
    if (entry) {
      updateState({ currentIndex: newIndex });
      return entry.resume;
    }
    
    return null;
  }, [state.canRedo, state.currentIndex, state.history, updateState]);

  // Track changes with debouncing
  const trackChange = useCallback((resume: Resume, description: string, action: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      addEntry(resume, description, action);
    }, debounceMs);
  }, [addEntry, debounceMs]);

  // Clear history
  const clearHistory = useCallback(() => {
    setState({
      canUndo: false,
      canRedo: false,
      history: [],
      currentIndex: -1,
      maxEntries
    });
  }, [maxEntries]);

  // Get current entry
  const getCurrentEntry = useCallback(() => {
    if (state.currentIndex >= 0 && state.currentIndex < state.history.length) {
      return state.history[state.currentIndex];
    }
    return null;
  }, [state.currentIndex, state.history]);

  // Get history summary
  const getHistorySummary = useCallback(() => {
    return {
      totalEntries: state.history.length,
      currentIndex: state.currentIndex,
      canUndo: state.canUndo,
      canRedo: state.canRedo,
      lastAction: getCurrentEntry()?.description || 'No actions yet'
    };
  }, [state, getCurrentEntry]);

  // Initialize with current resume
  const initialize = useCallback((resume: Resume) => {
    if (state.history.length === 0) {
      addEntry(resume, 'Initial state', 'init');
    }
    lastResumeRef.current = resume;
  }, [state.history.length, addEntry]);

  // Check if resume has changed
  const hasChanged = useCallback((resume: Resume) => {
    return JSON.stringify(resume) !== JSON.stringify(lastResumeRef.current);
  }, []);

  // Get undo/redo descriptions
  const getUndoDescription = useCallback(() => {
    if (!state.canUndo) return null;
    const entry = state.history[state.currentIndex - 1];
    return entry?.description || 'Undo';
  }, [state.canUndo, state.currentIndex, state.history]);

  const getRedoDescription = useCallback(() => {
    if (!state.canRedo) return null;
    const entry = state.history[state.currentIndex + 1];
    return entry?.description || 'Redo';
  }, [state.canRedo, state.currentIndex, state.history]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    // State
    ...state,
    
    // Actions
    undo,
    redo,
    trackChange,
    clearHistory,
    initialize,
    
    // Computed
    getCurrentEntry,
    getHistorySummary,
    getUndoDescription,
    getRedoDescription,
    hasChanged,
    
    // Configuration
    config: { maxEntries, debounceMs, autoSave }
  };
};

// Hook for tracking specific resume changes
export const useResumeHistory = (resume: Resume | null) => {
  const undoRedo = useUndoRedo({
    maxEntries: 30,
    debounceMs: 1500,
    autoSave: true
  });

  useEffect(() => {
    if (resume && undoRedo.history) {
      if (undoRedo.history.length === 0) {
        undoRedo.initialize(resume);
      } else if (undoRedo.hasChanged(resume)) {
        undoRedo.trackChange(resume, 'Resume updated', 'edit');
      }
    }
  }, [resume, undoRedo]);

  return undoRedo;
};
