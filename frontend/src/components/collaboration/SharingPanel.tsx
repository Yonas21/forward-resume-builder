import React, { useState } from 'react';
import type { ShareLink, ShareSettings, ShareStats, SharePermission } from '../../hooks/useSharing';

interface SharingPanelProps {
  shareLinks: ShareLink[];
  shareStats: ShareStats;
  onCreateShareLink: (settings: ShareSettings) => Promise<ShareLink>;
  onRevokeShareLink: (linkId: string) => Promise<void>;
  onCopyShareUrl: (link: ShareLink) => Promise<boolean>;
  className?: string;
}

export const SharingPanel: React.FC<SharingPanelProps> = ({
  shareLinks, shareStats, onCreateShareLink, onRevokeShareLink, onCopyShareUrl, className = ''
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowComments: false,
    allowEditing: false,
    requireApproval: false,
    notifyOnView: false,
    notifyOnComment: false,
    expiresInDays: undefined
  });

  const handleCreateShareLink = async () => {
    setIsCreating(true);
    try {
      await onCreateShareLink(shareSettings);
      setShowCreateForm(false);
      setShareSettings({
        allowComments: false,
        allowEditing: false,
        requireApproval: false,
        notifyOnView: false,
        notifyOnComment: false,
        expiresInDays: undefined
      });
    } catch (error) {
      console.error('Failed to create share link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyUrl = async (link: ShareLink) => {
    try {
      const success = await onCopyShareUrl(link);
      if (success) {
        // Show success message
        console.log('URL copied to clipboard');
      }
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getPermissionBadges = (permissions: SharePermission[]) => {
    return permissions.map(permission => (
      <span key={permission.type} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
        {permission.type}
      </span>
    ));
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header with stats and create button */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Share Resume</h3>
            <p className="text-sm text-gray-600">Create shareable links for feedback and collaboration</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Share Link
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
                         <div className="text-2xl font-bold text-blue-600">{shareStats.activeLinks}</div>
             <div className="text-sm text-gray-600">Active Links</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-green-600">{shareStats.totalViews}</div>
             <div className="text-sm text-gray-600">Total Views</div>
           </div>
           <div className="text-center">
             <div className="text-2xl font-bold text-purple-600">{shareStats.totalComments}</div>
             <div className="text-sm text-gray-600">Comments</div>
          </div>
        </div>
      </div>

      {/* Create Share Link Form */}
      {showCreateForm && (
        <div className="p-6 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Create New Share Link</h4>
          <div className="space-y-4">
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
               <div className="space-y-2">
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={shareSettings.allowComments}
                     onChange={(e) => setShareSettings({...shareSettings, allowComments: e.target.checked})}
                     className="mr-2"
                   />
                   Allow Comments
                 </label>
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={shareSettings.allowEditing}
                     onChange={(e) => setShareSettings({...shareSettings, allowEditing: e.target.checked})}
                     className="mr-2"
                   />
                   Allow Editing
                 </label>
                 <label className="flex items-center">
                   <input
                     type="checkbox"
                     checked={shareSettings.requireApproval}
                     onChange={(e) => setShareSettings({...shareSettings, requireApproval: e.target.checked})}
                     className="mr-2"
                   />
                   Require Approval
                 </label>
               </div>
             </div>

                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Expiration (Days)</label>
               <input
                 type="number"
                 placeholder="Leave empty for no expiration"
                 value={shareSettings.expiresInDays || ''}
                 onChange={(e) => setShareSettings({
                   ...shareSettings, 
                   expiresInDays: e.target.value ? parseInt(e.target.value) : undefined
                 })}
                 className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
               />
             </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateShareLink}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Link'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Links List */}
      {shareLinks.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No share links yet</h3>
          <p className="text-gray-600 mb-4">Create your first share link to start collaborating</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Share Link
          </button>
        </div>
      ) : (
        <div className="divide-y">
          {shareLinks.map((link) => (
            <div key={link.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Link {link.id.slice(0, 8)}
                    </span>
                    <div className="flex space-x-1">
                      {getPermissionBadges(link.permissions)}
                    </div>
                    {link.isActive ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    Created: {formatDate(link.createdAt)}
                    {link.expiresAt && ` • Expires: ${formatDate(link.expiresAt)}`}
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3">
                    Views: {link.viewCount} • Last viewed: {link.lastViewed ? formatDate(link.lastViewed) : 'Never'}
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCopyUrl(link)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
                    >
                      Copy URL
                    </button>
                    <button
                      onClick={() => onRevokeShareLink(link.id)}
                      className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent Activity */}
      {shareStats.recentActivity.length > 0 && (
        <div className="p-6 border-t bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Recent Activity</h4>
          <div className="space-y-3">
            {shareStats.recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                 <span className="text-gray-600">{activity.details || activity.type}</span>
                <span className="text-gray-400">{formatDate(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
