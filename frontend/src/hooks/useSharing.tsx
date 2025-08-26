import { useState, useCallback } from 'react';

export interface ShareLink {
  id: string;
  resumeId: string;
  token: string;
  permissions: SharePermission[];
  expiresAt?: Date;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  viewCount: number;
  lastViewed?: Date;
}

export interface SharePermission {
  type: 'view' | 'comment' | 'edit' | 'admin';
  description: string;
}

export interface ShareSettings {
  allowComments: boolean;
  allowEditing: boolean;
  requireApproval: boolean;
  notifyOnView: boolean;
  notifyOnComment: boolean;
  expiresInDays?: number;
}

export interface ShareStats {
  totalShares: number;
  totalViews: number;
  totalComments: number;
  activeLinks: number;
  recentActivity: ShareActivity[];
}

export interface ShareActivity {
  id: string;
  type: 'view' | 'comment' | 'edit' | 'share';
  userId: string;
  userName: string;
  timestamp: Date;
  details?: string;
}

export const useSharing = (resumeId: string) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [shareStats, setShareStats] = useState<ShareStats>({
    totalShares: 0,
    totalViews: 0,
    totalComments: 0,
    activeLinks: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Default permissions
  const defaultPermissions: SharePermission[] = [
    { type: 'view', description: 'Can view the resume' },
    { type: 'comment', description: 'Can add comments and feedback' }
  ];

  const adminPermissions: SharePermission[] = [
    { type: 'view', description: 'Can view the resume' },
    { type: 'comment', description: 'Can add comments and feedback' },
    { type: 'edit', description: 'Can edit the resume' },
    { type: 'admin', description: 'Full administrative access' }
  ];

  // Create a new share link
  const createShareLink = useCallback(async (settings: ShareSettings): Promise<ShareLink> => {
    setIsLoading(true);
    try {
      const permissions = settings.allowEditing ? adminPermissions : defaultPermissions;
      const expiresAt = settings.expiresInDays 
        ? new Date(Date.now() + settings.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const newLink: ShareLink = {
        id: `share_${Date.now()}`,
        resumeId,
        token: generateToken(),
        permissions,
        expiresAt,
        createdAt: new Date(),
        createdBy: 'current-user', // Replace with actual user ID
        isActive: true,
        viewCount: 0
      };

      setShareLinks(prev => [...prev, newLink]);
      setShareStats(prev => ({
        ...prev,
        totalShares: prev.totalShares + 1,
        activeLinks: prev.activeLinks + 1
      }));

      return newLink;
    } catch (error) {
      console.error('Error creating share link:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [resumeId]);

  // Generate a secure token for sharing
  const generateToken = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Get shareable URL
  const getShareUrl = useCallback((link: ShareLink): string => {
    return `${window.location.origin}/shared/${link.token}`;
  }, []);

  // Revoke a share link
  const revokeShareLink = useCallback(async (linkId: string): Promise<void> => {
    setIsLoading(true);
    try {
      setShareLinks(prev => prev.map(link => 
        link.id === linkId ? { ...link, isActive: false } : link
      ));
      setShareStats(prev => ({
        ...prev,
        activeLinks: prev.activeLinks - 1
      }));
    } catch (error) {
      console.error('Error revoking share link:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update share link settings
  const updateShareLink = useCallback(async (linkId: string, settings: Partial<ShareSettings>): Promise<void> => {
    setIsLoading(true);
    try {
      setShareLinks(prev => prev.map(link => {
        if (link.id === linkId) {
          const permissions = settings.allowEditing ? adminPermissions : defaultPermissions;
          const expiresAt = settings.expiresInDays 
            ? new Date(Date.now() + settings.expiresInDays * 24 * 60 * 60 * 1000)
            : link.expiresAt;

          return {
            ...link,
            permissions,
            expiresAt
          };
        }
        return link;
      }));
    } catch (error) {
      console.error('Error updating share link:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Track view activity
  const trackView = useCallback(async (linkId: string, viewerId: string, viewerName: string): Promise<void> => {
    try {
      setShareLinks(prev => prev.map(link => 
        link.id === linkId 
          ? { ...link, viewCount: link.viewCount + 1, lastViewed: new Date() }
          : link
      ));

      setShareStats(prev => ({
        ...prev,
        totalViews: prev.totalViews + 1,
        recentActivity: [
          {
            id: `activity_${Date.now()}`,
            type: 'view',
            userId: viewerId,
            userName: viewerName,
            timestamp: new Date(),
            details: 'Viewed the resume'
          },
          ...prev.recentActivity.slice(0, 9) // Keep last 10 activities
        ]
      }));
    } catch (error) {
      console.error('Error tracking view:', error);
    }
  }, []);

  // Get share link by token
  const getShareLinkByToken = useCallback((token: string): ShareLink | null => {
    return shareLinks.find(link => link.token === token && link.isActive) || null;
  }, [shareLinks]);

  // Check if link is expired
  const isLinkExpired = useCallback((link: ShareLink): boolean => {
    if (!link.expiresAt) return false;
    return new Date() > link.expiresAt;
  }, []);

  // Get active share links
  const getActiveShareLinks = useCallback((): ShareLink[] => {
    return shareLinks.filter(link => link.isActive && !isLinkExpired(link));
  }, [shareLinks, isLinkExpired]);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async (link: ShareLink): Promise<boolean> => {
    try {
      const url = getShareUrl(link);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return false;
    }
  }, [getShareUrl]);

  // Get sharing statistics
  const getSharingStats = useCallback((): ShareStats => {
    return {
      ...shareStats,
      activeLinks: getActiveShareLinks().length
    };
  }, [shareStats, getActiveShareLinks]);

  return {
    // State
    shareLinks,
    shareStats,
    isLoading,
    
    // Actions
    createShareLink,
    revokeShareLink,
    updateShareLink,
    trackView,
    copyShareUrl,
    
    // Utilities
    getShareUrl,
    getShareLinkByToken,
    isLinkExpired,
    getActiveShareLinks,
    getSharingStats,
    
    // Constants
    defaultPermissions,
    adminPermissions
  };
};
