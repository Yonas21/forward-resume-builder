import React, { useState } from 'react';
import { ShareLink, ShareSettings, ShareStats } from '../hooks/useSharing';

interface SharingPanelProps {
  shareLinks: ShareLink[];
  shareStats: ShareStats;
  onCreateShareLink: (settings: ShareSettings) => Promise<ShareLink>;
  onRevokeShareLink: (linkId: string) => Promise<void>;
  onUpdateShareLink: (linkId: string, settings: Partial<ShareSettings>) => Promise<void>;
  onCopyShareUrl: (link: ShareLink) => Promise<boolean>;
  isLoading?: boolean;
  className?: string;
}

export const SharingPanel: React.FC<SharingPanelProps> = ({
  shareLinks,
  shareStats,
  onCreateShareLink,
  onRevokeShareLink,
  onUpdateShareLink,
  onCopyShareUrl,
  isLoading = false,
  className = ''
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [shareSettings, setShareSettings] = useState<ShareSettings>({
    allowComments: true,
    allowEditing: false,
    requireApproval: false,
    notifyOnView: true,
    notifyOnComment: true,
    expiresInDays: 30
  });

  const handleCreateShareLink = async () => {
    setIsCreating(true);
    try {
      await onCreateShareLink(shareSettings);
      setShowCreateForm(false);
      setShareSettings({
        allowComments: true,
        allowEditing: false,
        requireApproval: false,
        notifyOnView: true,
        notifyOnComment: true,
        expiresInDays: 30
      });
    } catch (error) {
      console.error('Error creating share link:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyUrl = async (link: ShareLink) => {
    const success = await onCopyShareUrl(link);
    if (success) {
      // Show success notification
      console.log('URL copied to clipboard');
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

  const getPermissionBadges = (permissions: any[]) => {
    return permissions.map(permission => (
      <span
        key={permission.type}
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          permission.type === 'admin' ? 'bg-red-100 text-red-800' :
          permission.type === 'edit' ? 'bg-orange-100 text-orange-800' :
          permission.type === 'comment' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}
      >
        {permission.type}
      </span>
    ));
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Sharing</h3>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
            disabled={isLoading}
          >
            Create Share Link
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{shareStats.totalShares}</div>
            <div className="text-sm text-gray-600">Total Shares</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{shareStats.totalViews}</div>
            <div className="text-sm text-gray-600">Total Views</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{shareStats.totalComments}</div>
            <div className="text-sm text-gray-600">Comments</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{shareStats.activeLinks}</div>
            <div className="text-sm text-gray-600">Active Links</div>
          </div>
        </div>
      </div>

      {/* Create Share Link Form */}
      {showCreateForm && (
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Create Share Link</h4>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allow Comments
                </label>
                <input
                  type="checkbox"
                  checked={shareSettings.allowComments}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowComments: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allow Editing
                </label>
                <input
                  type="checkbox"
                  checked={shareSettings.allowEditing}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, allowEditing: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Require Approval
                </label>
                <input
                  type="checkbox"
                  checked={shareSettings.requireApproval}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, requireApproval: e.target.checked }))}
                  className="rounded border-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expires In (Days)
                </label>
                <input
                  type="number"
                  value={shareSettings.expiresInDays || ''}
                  onChange={(e) => setShareSettings(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) || undefined }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCreateShareLink}
                disabled={isCreating}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Link'}
              </button>
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Links List */}
      <div className="max-h-96 overflow-y-auto">
        {shareLinks.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <p>No share links created yet</p>
            <p className="text-sm">Create a share link to start collaborating</p>
          </div>
        ) : (
          <div className="divide-y">
            {shareLinks.map((link) => (
              <div key={link.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Share Link #{link.id.slice(-6)}
                      </span>
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

                    <div className="flex items-center space-x-2 mb-2">
                      {getPermissionBadges(link.permissions)}
                    </div>

                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Created: {formatDate(link.createdAt)}</p>
                      <p>Views: {link.viewCount}</p>
                      {link.lastViewed && (
                        <p>Last viewed: {formatDate(link.lastViewed)}</p>
                      )}
                      {link.expiresAt && (
                        <p>Expires: {formatDate(link.expiresAt)}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleCopyUrl(link)}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      title="Copy URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onRevokeShareLink(link.id)}
                      className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
                      title="Revoke Link"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      {shareStats.recentActivity.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Recent Activity</h4>
          <div className="space-y-2">
            {shareStats.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>{activity.userName}</span>
                <span>{activity.details}</span>
                <span className="text-gray-400">{formatDate(activity.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
