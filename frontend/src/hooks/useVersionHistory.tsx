import { useState, useCallback } from 'react';
import type { Resume } from '../types';

export interface Version {
  id: string;
  resumeId: string;
  versionNumber: number;
  name: string;
  description: string;
  data: Resume;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  isPublished: boolean;
  isCurrent: boolean;
  parentVersionId?: string;
  branchName?: string;
  tags: string[];
  changeSummary: string;
  diffStats: DiffStats;
}

export interface DiffStats {
  sectionsAdded: number;
  sectionsModified: number;
  sectionsRemoved: number;
  totalChanges: number;
}

export interface VersionDiff {
  versionA: Version;
  versionB: Version;
  changes: SectionDiff[];
  summary: DiffStats;
}

export interface SectionDiff {
  section: string;
  type: 'added' | 'modified' | 'removed' | 'unchanged';
  oldContent?: any;
  newContent?: any;
  changes: FieldChange[];
}

export interface FieldChange {
  field: string;
  type: 'added' | 'modified' | 'removed';
  oldValue?: any;
  newValue?: any;
  path: string[];
}

export interface VersionHistoryConfig {
  maxVersions?: number;
  autoSave?: boolean;
  saveInterval?: number;
  enableBranching?: boolean;
}

export const useVersionHistory = (resumeId: string, config: VersionHistoryConfig = {}) => {
  const {
    maxVersions = 50,
    autoSave = true,
    saveInterval = 300000, // 5 minutes
    enableBranching = true
  } = config;

  const [versions, setVersions] = useState<Version[]>([]);
  const [currentVersion, setCurrentVersion] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);

  // Create a new version
  const createVersion = useCallback(async (
    data: Resume,
    name: string,
    description: string,
    parentVersionId?: string,
    branchName?: string
  ): Promise<Version> => {
    setIsLoading(true);
    try {
      const versionNumber = versions.length + 1;
      const parentVersion = parentVersionId ? versions.find(v => v.id === parentVersionId) : null;
      
      const newVersion: Version = {
        id: `version_${Date.now()}`,
        resumeId,
        versionNumber,
        name,
        description,
        data: JSON.parse(JSON.stringify(data)), // Deep clone
        createdAt: new Date(),
        createdBy: 'current-user', // Replace with actual user ID
        createdByName: 'Current User', // Replace with actual user name
        isPublished: false,
        isCurrent: true,
        parentVersionId,
        branchName: branchName || (parentVersion ? `${parentVersion.branchName || 'main'}_branch` : 'main'),
        tags: [],
        changeSummary: description,
        diffStats: parentVersion ? calculateDiffStats(parentVersion.data, data) : {
          sectionsAdded: 0,
          sectionsModified: 0,
          sectionsRemoved: 0,
          totalChanges: 0
        }
      };

      // Update previous current version
      setVersions(prev => prev.map(v => ({ ...v, isCurrent: false })));

      // Add new version
      setVersions(prev => {
        const updated = [...prev, newVersion];
        // Keep only the latest versions
        if (updated.length > maxVersions) {
          return updated.slice(-maxVersions);
        }
        return updated;
      });

      setCurrentVersion(newVersion);
      setLastAutoSave(new Date());

      return newVersion;
    } catch (error) {
      console.error('Error creating version:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [versions, maxVersions]);

  // Calculate diff statistics between two versions
  const calculateDiffStats = useCallback((oldData: Resume, newData: Resume): DiffStats => {
    const sectionsAdded = 0;
    const sectionsModified = 0;
    const sectionsRemoved = 0;
    let totalChanges = 0;

    // Compare sections
    const oldSections = Object.keys(oldData);
    const newSections = Object.keys(newData);

    // Find added sections
    newSections.forEach(section => {
      if (!oldSections.includes(section)) {
        sectionsAdded++;
        totalChanges++;
      }
    });

    // Find removed sections
    oldSections.forEach(section => {
      if (!newSections.includes(section)) {
        sectionsRemoved++;
        totalChanges++;
      }
    });

    // Find modified sections
    oldSections.forEach(section => {
      if (newSections.includes(section)) {
        const oldSection = oldData[section as keyof Resume];
        const newSection = newData[section as keyof Resume];
        
        if (JSON.stringify(oldSection) !== JSON.stringify(newSection)) {
          sectionsModified++;
          totalChanges++;
        }
      }
    });

    return {
      sectionsAdded,
      sectionsModified,
      sectionsRemoved,
      totalChanges
    };
  }, []);

  // Compare two versions
  const compareVersions = useCallback((versionAId: string, versionBId: string): VersionDiff | null => {
    const versionA = versions.find(v => v.id === versionAId);
    const versionB = versions.find(v => v.id === versionBId);

    if (!versionA || !versionB) return null;

    const changes: SectionDiff[] = [];
    const oldSections = Object.keys(versionA.data);
    const newSections = Object.keys(versionB.data);

    // Find added sections
    newSections.forEach(section => {
      if (!oldSections.includes(section)) {
        changes.push({
          section,
          type: 'added',
          newContent: versionB.data[section as keyof Resume],
          changes: []
        });
      }
    });

    // Find removed sections
    oldSections.forEach(section => {
      if (!newSections.includes(section)) {
        changes.push({
          section,
          type: 'removed',
          oldContent: versionA.data[section as keyof Resume],
          changes: []
        });
      }
    });

    // Find modified sections
    oldSections.forEach(section => {
      if (newSections.includes(section)) {
        const oldSection = versionA.data[section as keyof Resume];
        const newSection = versionB.data[section as keyof Resume];
        
        if (JSON.stringify(oldSection) !== JSON.stringify(newSection)) {
          const fieldChanges = compareFields(oldSection, newSection, [section]);
          
          changes.push({
            section,
            type: 'modified',
            oldContent: oldSection,
            newContent: newSection,
            changes: fieldChanges
          });
        } else {
          changes.push({
            section,
            type: 'unchanged',
            oldContent: oldSection,
            newContent: newSection,
            changes: []
          });
        }
      }
    });

    const summary = calculateDiffStats(versionA.data, versionB.data);

    return {
      versionA,
      versionB,
      changes,
      summary
    };
  }, [versions, calculateDiffStats]);

  // Compare fields recursively
  const compareFields = useCallback((oldValue: any, newValue: any, path: string[]): FieldChange[] => {
    const changes: FieldChange[] = [];

    if (typeof oldValue !== typeof newValue) {
      changes.push({
        field: path[path.length - 1],
        type: 'modified',
        oldValue,
        newValue,
        path
      });
      return changes;
    }

    if (typeof oldValue === 'object' && oldValue !== null && newValue !== null) {
      if (Array.isArray(oldValue) && Array.isArray(newValue)) {
        // Compare arrays
        const maxLength = Math.max(oldValue.length, newValue.length);
        for (let i = 0; i < maxLength; i++) {
          if (i >= oldValue.length) {
            changes.push({
              field: `${path[path.length - 1]}[${i}]`,
              type: 'added',
              newValue: newValue[i],
              path: [...path, i.toString()]
            });
          } else if (i >= newValue.length) {
            changes.push({
              field: `${path[path.length - 1]}[${i}]`,
              type: 'removed',
              oldValue: oldValue[i],
              path: [...path, i.toString()]
            });
          } else if (JSON.stringify(oldValue[i]) !== JSON.stringify(newValue[i])) {
            changes.push(...compareFields(oldValue[i], newValue[i], [...path, i.toString()]));
          }
        }
      } else {
        // Compare objects
        const oldKeys = Object.keys(oldValue);
        const newKeys = Object.keys(newValue);

        newKeys.forEach(key => {
          if (!oldKeys.includes(key)) {
            changes.push({
              field: key,
              type: 'added',
              newValue: newValue[key],
              path: [...path, key]
            });
          }
        });

        oldKeys.forEach(key => {
          if (!newKeys.includes(key)) {
            changes.push({
              field: key,
              type: 'removed',
              oldValue: oldValue[key],
              path: [...path, key]
            });
          } else if (JSON.stringify(oldValue[key]) !== JSON.stringify(newValue[key])) {
            changes.push(...compareFields(oldValue[key], newValue[key], [...path, key]));
          }
        });
      }
    } else if (oldValue !== newValue) {
      changes.push({
        field: path[path.length - 1],
        type: 'modified',
        oldValue,
        newValue,
        path
      });
    }

    return changes;
  }, []);

  // Restore to a specific version
  const restoreVersion = useCallback(async (versionId: string): Promise<Resume> => {
    const version = versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    // Create a new version from the restored one
    await createVersion(
      version.data,
      `Restored: ${version.name}`,
      `Restored from version ${version.versionNumber}`,
      versionId
    );

    return version.data;
  }, [versions, createVersion]);

  // Create a branch from a version
  const createBranch = useCallback(async (
    versionId: string,
    branchName: string,
    initialData?: Resume
  ): Promise<Version> => {
    const version = versions.find(v => v.id === versionId);
    if (!version) {
      throw new Error('Version not found');
    }

    const data = initialData || version.data;
    return await createVersion(
      data,
      `Branch: ${branchName}`,
      `Created branch from version ${version.versionNumber}`,
      versionId,
      branchName
    );
  }, [versions, createVersion]);

  // Get versions by branch
  const getVersionsByBranch = useCallback((branchName: string): Version[] => {
    return versions.filter(v => v.branchName === branchName);
  }, [versions]);

  // Get all branches
  const getBranches = useCallback((): string[] => {
    const branches = new Set<string>();
    versions.forEach(v => {
      if (v.branchName) {
        branches.add(v.branchName);
      }
    });
    return Array.from(branches);
  }, [versions]);

  // Publish a version
  const publishVersion = useCallback(async (versionId: string): Promise<void> => {
    setVersions(prev => prev.map(v => ({
      ...v,
      isPublished: v.id === versionId
    })));
  }, []);

  // Get version history
  const getVersionHistory = useCallback((): Version[] => {
    return versions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [versions]);

  // Get current version
  const getCurrentVersion = useCallback((): Version | null => {
    return versions.find(v => v.isCurrent) || null;
  }, [versions]);

  // Auto-save functionality
  const autoSave = useCallback(async (data: Resume): Promise<void> => {
    if (!autoSave) return;

    const now = new Date();
    const timeSinceLastSave = lastAutoSave ? now.getTime() - lastAutoSave.getTime() : saveInterval;

    if (timeSinceLastSave >= saveInterval) {
      await createVersion(
        data,
        `Auto-save ${now.toLocaleTimeString()}`,
        'Automatic save',
        currentVersion?.id
      );
    }
  }, [autoSave, saveInterval, lastAutoSave, currentVersion, createVersion]);

  return {
    // State
    versions,
    currentVersion,
    isLoading,
    
    // Actions
    createVersion,
    restoreVersion,
    createBranch,
    publishVersion,
    autoSave,
    
    // Queries
    compareVersions,
    getVersionsByBranch,
    getBranches,
    getVersionHistory,
    getCurrentVersion,
    
    // Utilities
    calculateDiffStats,
    
    // Configuration
    config: { maxVersions, autoSave, saveInterval, enableBranching }
  };
};
