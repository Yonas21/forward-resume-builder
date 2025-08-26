import React, { useState } from 'react';
import { Collaborator, CollaborationSession } from '../hooks/useCollaborativeEditing';

interface CollaborativeEditingProps {
  session: CollaborationSession | null;
  collaborators: Collaborator[];
  currentUser: Collaborator | null;
  onInitializeSession: (user: any) => Promise<CollaborationSession>;
  onJoinSession: (sessionId: string, user: any) => Promise<CollaborationSession>;
  onLeaveSession: () => Promise<void>;
  onUpdateCursorPosition: (position: any) => void;
  onUpdateCurrentSection: (section: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const CollaborativeEditing: React.FC<CollaborativeEditingProps> = ({
  session,
  collaborators,
  currentUser,
  onInitializeSession,
  onJoinSession,
  onLeaveSession,
  onUpdateCursorPosition,
  onUpdateCurrentSection,
  isLoading = false,
  className = ''
}) => {
  const [showJoinForm, setShowJoinForm] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'editor' | 'viewer' | 'commenter'>('editor');

  const onlineCollaborators = collaborators.filter(c => c.isOnline);
  const offlineCollaborators = collaborators.filter(c => !c.isOnline);

  const handleInitializeSession = async () => {
    if (!userName.trim() || !userEmail.trim()) return;

    try {
      await onInitializeSession({
        id: 'current-user',
        name: userName,
        email: userEmail,
        role: 'owner'
      });
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionId.trim() || !userName.trim() || !userEmail.trim()) return;

    try {
      await onJoinSession(sessionId, {
        id: 'current-user',
        name: userName,
        email: userEmail,
        role: userRole
      });
      setShowJoinForm(false);
    } catch (error) {
      console.error('Error joining session:', error);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await onLeaveSession();
    } catch (error) {
      console.error('Error leaving session:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800';
      case 'editor':
        return 'bg-blue-100 text-blue-800';
      case 'commenter':
        return 'bg-green-100 text-green-800';
      case 'viewer':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIndicator = (isOnline: boolean, lastSeen: Date) => {
    if (isOnline) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600">Online</span>
        </div>
      );
    }

    const timeSinceLastSeen = Date.now() - lastSeen.getTime();
    const minutesAgo = Math.floor(timeSinceLastSeen / (1000 * 60));

    if (minutesAgo < 1) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-yellow-600">Just now</span>
        </div>
      );
    } else if (minutesAgo < 60) {
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="text-xs text-yellow-600">{minutesAgo}m ago</span>
        </div>
      );
    } else {
      const hoursAgo = Math.floor(minutesAgo / 60);
      return (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
          <span className="text-xs text-gray-600">{hoursAgo}h ago</span>
        </div>
      );
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Collaboration</h3>
          {session ? (
            <button
              onClick={handleLeaveSession}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
            >
              Leave Session
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowJoinForm(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Join Session
              </button>
              <button
                onClick={handleInitializeSession}
                className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Start Session
              </button>
            </div>
          )}
        </div>

        {session && (
          <div className="mt-2 text-sm text-gray-600">
            <p>Session ID: {session.id}</p>
            <p>Started: {formatTime(session.startedAt)}</p>
            <p>Last activity: {formatTime(session.lastActivity)}</p>
          </div>
        )}
      </div>

      {/* Join Form */}
      {showJoinForm && !session && (
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Join Collaboration Session</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session ID
              </label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="editor">Editor</option>
                <option value="commenter">Commenter</option>
                <option value="viewer">Viewer</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleJoinSession}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Session
              </button>
              <button
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-2 text-gray-600 text-sm rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Form */}
      {!session && !showJoinForm && (
        <div className="p-4 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-3">Start New Collaboration Session</h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Email
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={handleInitializeSession}
              className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Session
            </button>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      {session && (
        <div className="max-h-96 overflow-y-auto">
          {/* Online Collaborators */}
          {onlineCollaborators.length > 0 && (
            <div className="p-4 border-b">
              <h4 className="font-medium text-gray-900 mb-3">Online ({onlineCollaborators.length})</h4>
              <div className="space-y-2">
                {onlineCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{collaborator.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(collaborator.role)}`}>
                            {collaborator.role}
                          </span>
                        </div>
                        
                        {collaborator.currentSection && (
                          <p className="text-xs text-gray-600">
                            Working on: {collaborator.currentSection}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIndicator(collaborator.isOnline, collaborator.lastSeen)}
                      {collaborator.cursorPosition && (
                        <span className="text-xs text-gray-500">
                          Editing {collaborator.cursorPosition.field}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Offline Collaborators */}
          {offlineCollaborators.length > 0 && (
            <div className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Recently Online ({offlineCollaborators.length})</h4>
              <div className="space-y-2">
                {offlineCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {collaborator.avatar ? (
                        <img
                          src={collaborator.avatar}
                          alt={collaborator.name}
                          className="w-8 h-8 rounded-full opacity-50"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white text-sm font-medium opacity-50">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{collaborator.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${getRoleColor(collaborator.role)}`}>
                            {collaborator.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {getStatusIndicator(collaborator.isOnline, collaborator.lastSeen)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {collaborators.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
              <p>No collaborators yet</p>
              <p className="text-sm">Share the session ID to invite others</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
