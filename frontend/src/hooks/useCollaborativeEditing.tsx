import { useState, useCallback, useEffect, useRef } from 'react';


export interface Collaborator {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer' | 'commenter';
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  currentSection?: string;
  cursorPosition?: CursorPosition;
}

export interface CursorPosition {
  section: string;
  field: string;
  offset: number;
  selectionStart?: number;
  selectionEnd?: number;
}

export interface EditOperation {
  id: string;
  type: 'insert' | 'delete' | 'replace' | 'move';
  section: string;
  field: string;
  path: string[];
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  userId: string;
  userName: string;
  version: number;
}

export interface Conflict {
  id: string;
  operationA: EditOperation;
  operationB: EditOperation;
  status: 'pending' | 'resolved' | 'ignored';
  resolution?: 'keep-a' | 'keep-b' | 'merge' | 'manual';
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface CollaborationSession {
  id: string;
  resumeId: string;
  collaborators: Collaborator[];
  operations: EditOperation[];
  conflicts: Conflict[];
  isActive: boolean;
  startedAt: Date;
  lastActivity: Date;
}

export interface CollaborativeEditingConfig {
  enableRealTime?: boolean;
  conflictResolution?: 'auto' | 'manual' | 'last-wins';
  presenceUpdateInterval?: number;
  operationDebounceMs?: number;
}

export const useCollaborativeEditing = (
  resumeId: string,
  config: CollaborativeEditingConfig = {}
) => {
  const {
    enableRealTime = true,
    conflictResolution = 'auto',
    presenceUpdateInterval = 30000, // 30 seconds
    operationDebounceMs = 500
  } = config;

  const [session, setSession] = useState<CollaborationSession | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [operations, setOperations] = useState<EditOperation[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isOnline, setIsOnline] = useState(false);
  const [currentUser, setCurrentUser] = useState<Collaborator | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const operationQueue = useRef<EditOperation[]>([]);
  const presenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize collaboration session
  const initializeSession = useCallback(async (user: Omit<Collaborator, 'isOnline' | 'lastSeen'>): Promise<CollaborationSession> => {
    setIsLoading(true);
    try {
      const newSession: CollaborationSession = {
        id: `session_${Date.now()}`,
        resumeId,
        collaborators: [{
          ...user,
          isOnline: true,
          lastSeen: new Date()
        }],
        operations: [],
        conflicts: [],
        isActive: true,
        startedAt: new Date(),
        lastActivity: new Date()
      };

      setSession(newSession);
      setCollaborators(newSession.collaborators);
      setCurrentUser(newSession.collaborators[0]);
      setIsOnline(true);

      // Start presence updates
      startPresenceUpdates();

      return newSession;
    } catch (error) {
      console.error('Error initializing session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  // Join existing session
  const joinSession = useCallback(async (

    user: Omit<Collaborator, 'isOnline' | 'lastSeen'>
  ): Promise<CollaborationSession> => {
    setIsLoading(true);
    try {
      if (!session) {
        throw new Error('No active session');
      }

      const newCollaborator: Collaborator = {
        ...user,
        isOnline: true,
        lastSeen: new Date()
      };

      const updatedSession = {
        ...session,
        collaborators: [...session.collaborators, newCollaborator],
        lastActivity: new Date()
      };

      setSession(updatedSession);
      setCollaborators(updatedSession.collaborators);
      setCurrentUser(newCollaborator);
      setIsOnline(true);

      // Notify other collaborators
      notifyCollaboratorJoined(newCollaborator);

      return updatedSession;
    } catch (error) {
      console.error('Error joining session:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  // Leave session
  const leaveSession = useCallback(async (): Promise<void> => {
    if (!currentUser || !session) return;

    try {
      const updatedCollaborators = collaborators.map(collab =>
        collab.id === currentUser.id
          ? { ...collab, isOnline: false, lastSeen: new Date() }
          : collab
      );

      const updatedSession = {
        ...session,
        collaborators: updatedCollaborators,
        lastActivity: new Date()
      };

      setSession(updatedSession);
      setCollaborators(updatedCollaborators);
      setCurrentUser(null);
      setIsOnline(false);

      // Stop presence updates
      stopPresenceUpdates();

      // Notify other collaborators
      notifyCollaboratorLeft(currentUser);
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  }, [currentUser, session, collaborators]);

  // Apply edit operation
  const applyEdit = useCallback(async (operation: Omit<EditOperation, 'id' | 'timestamp' | 'version'>): Promise<void> => {
    if (!currentUser || !session) return;

    const newOperation: EditOperation = {
      ...operation,
      id: `op_${Date.now()}_${Math.random()}`,
      timestamp: new Date(),
      version: operations.length + 1
    };

    // Add to queue for debouncing
    operationQueue.current.push(newOperation);

    // Clear existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new debounce timer
    debounceTimer.current = setTimeout(() => {
      processOperationQueue();
    }, operationDebounceMs);
  }, [currentUser, session, operations, operationDebounceMs]);

  // Process operation queue
  const processOperationQueue = useCallback(async (): Promise<void> => {
    if (operationQueue.current.length === 0) return;

    const operationsToProcess = [...operationQueue.current];
    operationQueue.current = [];

    try {
      // Check for conflicts
      const newConflicts = detectConflicts(operationsToProcess);
      
      if (newConflicts.length > 0) {
        setConflicts(prev => [...prev, ...newConflicts]);
        
        if (conflictResolution === 'auto') {
          await resolveConflicts(newConflicts);
        }
      }

      // Apply operations
      setOperations(prev => [...prev, ...operationsToProcess]);
      
      // Update session
      if (session) {
        setSession(prev => prev ? {
          ...prev,
          operations: [...prev.operations, ...operationsToProcess],
          lastActivity: new Date()
        } : null);
      }

      // Notify other collaborators
      notifyOperationsApplied(operationsToProcess);
    } catch (error) {
      console.error('Error processing operations:', error);
    }
  }, [session, conflictResolution]);

  // Detect conflicts between operations
  const detectConflicts = useCallback((newOperations: EditOperation[]): Conflict[] => {
    const conflicts: Conflict[] = [];

    newOperations.forEach((opA, index) => {
      newOperations.slice(index + 1).forEach(opB => {
        if (opA.userId !== opB.userId && 
            opA.section === opB.section && 
            opA.field === opB.field &&
            opA.path.join('.') === opB.path.join('.')) {
          
          conflicts.push({
            id: `conflict_${Date.now()}_${Math.random()}`,
            operationA: opA,
            operationB: opB,
            status: 'pending'
          });
        }
      });
    });

    return conflicts;
  }, []);

  // Resolve conflicts automatically
  const resolveConflicts = useCallback(async (conflictsToResolve: Conflict[]): Promise<void> => {
    const resolvedConflicts = conflictsToResolve.map(conflict => {
      let resolution: Conflict['resolution'] = 'manual';

      if (conflictResolution === 'last-wins') {
        resolution = conflict.operationA.timestamp > conflict.operationB.timestamp ? 'keep-a' : 'keep-b';
      } else if (conflictResolution === 'auto') {
        // Simple auto-resolution: keep the operation with more recent timestamp
        resolution = conflict.operationA.timestamp > conflict.operationB.timestamp ? 'keep-a' : 'keep-b';
      }

      return {
        ...conflict,
        status: 'resolved' as const,
        resolution,
        resolvedBy: 'system',
        resolvedAt: new Date()
      };
    });

    setConflicts(prev => prev.map(conflict => {
      const resolved = resolvedConflicts.find(r => r.id === conflict.id);
      return resolved || conflict;
    }));
  }, [conflictResolution]);

  // Update cursor position
  const updateCursorPosition = useCallback((position: CursorPosition): void => {
    if (!currentUser) return;

    setCollaborators(prev => prev.map(collab =>
      collab.id === currentUser.id
        ? { ...collab, cursorPosition: position }
        : collab
    ));

    // Notify other collaborators
    notifyCursorUpdate(position);
  }, [currentUser]);

  // Update current section
  const updateCurrentSection = useCallback((section: string): void => {
    if (!currentUser) return;

    setCollaborators(prev => prev.map(collab =>
      collab.id === currentUser.id
        ? { ...collab, currentSection: section }
        : collab
    ));

    // Notify other collaborators
    notifySectionUpdate(section);
  }, [currentUser]);

  // Start presence updates
  const startPresenceUpdates = useCallback((): void => {
    if (presenceTimer.current) {
      clearInterval(presenceTimer.current);
    }

    presenceTimer.current = setInterval(() => {
      if (currentUser) {
        setCollaborators(prev => prev.map(collab =>
          collab.id === currentUser.id
            ? { ...collab, lastSeen: new Date() }
            : collab
        ));

        // Notify other collaborators
        notifyPresenceUpdate();
      }
    }, presenceUpdateInterval);
  }, [currentUser, presenceUpdateInterval]);

  // Stop presence updates
  const stopPresenceUpdates = useCallback((): void => {
    if (presenceTimer.current) {
      clearInterval(presenceTimer.current);
      presenceTimer.current = null;
    }
  }, []);

  // Get online collaborators
  const getOnlineCollaborators = useCallback((): Collaborator[] => {
    return collaborators.filter(collab => collab.isOnline);
  }, [collaborators]);

  // Get collaborators by role
  const getCollaboratorsByRole = useCallback((role: Collaborator['role']): Collaborator[] => {
    return collaborators.filter(collab => collab.role === role);
  }, [collaborators]);

  // Check if user has permission
  const hasPermission = useCallback((permission: 'edit' | 'comment' | 'view'): boolean => {
    if (!currentUser) return false;

    switch (permission) {
      case 'edit':
        return currentUser.role === 'owner' || currentUser.role === 'editor';
      case 'comment':
        return currentUser.role === 'owner' || currentUser.role === 'editor' || currentUser.role === 'commenter';
      case 'view':
        return true;
      default:
        return false;
    }
  }, [currentUser]);

  // Notification functions (to be implemented with WebSocket or similar)
  const notifyCollaboratorJoined = useCallback((collaborator: Collaborator): void => {
    // Implement WebSocket notification
    console.log('Collaborator joined:', collaborator.name);
  }, []);

  const notifyCollaboratorLeft = useCallback((collaborator: Collaborator): void => {
    // Implement WebSocket notification
    console.log('Collaborator left:', collaborator.name);
  }, []);

  const notifyOperationsApplied = useCallback((operations: EditOperation[]): void => {
    // Implement WebSocket notification
    console.log('Operations applied:', operations.length);
  }, []);

  const notifyCursorUpdate = useCallback((position: CursorPosition): void => {
    // Implement WebSocket notification
    console.log('Cursor updated:', position);
  }, []);

  const notifySectionUpdate = useCallback((section: string): void => {
    // Implement WebSocket notification
    console.log('Section updated:', section);
  }, []);

  const notifyPresenceUpdate = useCallback((): void => {
    // Implement WebSocket notification
    console.log('Presence updated');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPresenceUpdates();
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [stopPresenceUpdates]);

  return {
    // State
    session,
    collaborators,
    operations,
    conflicts,
    isOnline,
    currentUser,
    isLoading,
    
    // Actions
    initializeSession,
    joinSession,
    leaveSession,
    applyEdit,
    updateCursorPosition,
    updateCurrentSection,
    
    // Queries
    getOnlineCollaborators,
    getCollaboratorsByRole,
    hasPermission,
    
    // Utilities
    startPresenceUpdates,
    stopPresenceUpdates,
    
    // Configuration
    config: { enableRealTime, conflictResolution, presenceUpdateInterval, operationDebounceMs }
  };
};
