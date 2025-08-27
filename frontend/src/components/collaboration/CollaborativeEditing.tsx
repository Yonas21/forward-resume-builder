import React, { useState } from 'react';
import type { Collaborator, CollaborationSession } from '../../hooks/useCollaborativeEditing';

interface CollaborativeEditingProps {
  session: CollaborationSession | null;
  collaborators: Collaborator[];
  currentUser: Collaborator | null;
  onInitializeSession: (user: any) => Promise<CollaborationSession>;
  onJoinSession: (user: any) => Promise<CollaborationSession>;
  onLeaveSession: () => Promise<void>;
  onUpdateCursorPosition: (position: any) => void;
  onUpdateCurrentSection: (section: string) => void;
  isLoading?: boolean;
  className?: string;
}

export const CollaborativeEditing: React.FC<CollaborativeEditingProps> = ({
  session, collaborators, onInitializeSession, onJoinSession, onLeaveSession, className = ''
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
        name: userName,
        email: userEmail,
        role: userRole
      });
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  };

  const handleJoinSession = async () => {
    if (!userName.trim() || !userEmail.trim()) return;
    
    try {
      await onJoinSession({
        name: userName,
        email: userEmail,
        role: userRole
      });
      setShowJoinForm(false);
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  const handleLeaveSession = async () => {
    try {
      await onLeaveSession();
    } catch (error) {
      console.error('Failed to leave session:', error);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString();
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-purple-100 text-purple-800';
      case 'editor': return 'bg-blue-100 text-blue-800';
      case 'viewer': return 'bg-green-100 text-green-800';
      case 'commenter': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };



  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header with session start/join/leave buttons */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Real-time Collaboration</h3>
            <p className="text-sm text-gray-600">Collaborate with others in real-time</p>
          </div>
          {session ? (
            <button
              onClick={handleLeaveSession}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Session
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowJoinForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Session
              </button>
            </div>
          )}
        </div>

        {/* Session Info */}
        {session && (
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-blue-900">Active Session</h4>
                <p className="text-sm text-blue-700">Session ID: {session.id}</p>
                <p className="text-sm text-blue-700">Session ID: {session.id}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{onlineCollaborators.length}</div>
                <div className="text-sm text-blue-700">Online</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Join Form */}
      {showJoinForm && !session && (
        <div className="p-6 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Join Collaboration Session</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Session ID</label>
              <input
                type="text"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder="Enter session ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="editor">Editor - Can edit the resume</option>
                <option value="viewer">Viewer - Can only view</option>
                <option value="commenter">Commenter - Can view and comment</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleJoinSession}
                disabled={!sessionId.trim() || !userName.trim() || !userEmail.trim()}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                Join Session
              </button>
              <button
                onClick={() => setShowJoinForm(false)}
                className="px-4 py-2 text-gray-600 text-sm font-medium hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Start Session Form */}
      {!session && !showJoinForm && (
        <div className="p-6 border-b bg-gray-50">
          <h4 className="font-medium text-gray-900 mb-4">Start New Collaboration Session</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="editor">Editor - Can edit the resume</option>
                <option value="viewer">Viewer - Can only view</option>
                <option value="commenter">Commenter - Can view and comment</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleInitializeSession}
                disabled={!userName.trim() || !userEmail.trim()}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                Start Session
              </button>
              <button
                onClick={() => setShowJoinForm(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Join Existing Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborators List */}
      {session && (
        <div className="p-6">
          <h4 className="font-medium text-gray-900 mb-4">Collaborators</h4>
          
          {/* Online Collaborators */}
          {onlineCollaborators.length > 0 && (
            <div className="mb-6">
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Online ({onlineCollaborators.length})
              </h5>
              <div className="space-y-3">
                {onlineCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-700">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{collaborator.name}</div>
                        <div className="text-sm text-gray-600">{collaborator.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </span>
                      {collaborator.currentSection && (
                        <span className="text-xs text-gray-500">
                          Editing: {collaborator.currentSection}
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
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                Recently Online ({offlineCollaborators.length})
              </h5>
              <div className="space-y-3">
                {offlineCollaborators.map((collaborator) => (
                  <div key={collaborator.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-gray-700">
                          {collaborator.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{collaborator.name}</div>
                        <div className="text-sm text-gray-600">{collaborator.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(collaborator.role)}`}>
                        {collaborator.role}
                      </span>
                      <span className="text-xs text-gray-500">
                        Last seen: {formatTime(collaborator.lastSeen)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {collaborators.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No collaborators yet</h3>
              <p className="text-gray-600 mb-4">Share the session ID with others to start collaborating</p>
              {session && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-700 mb-2">Session ID:</p>
                  <div className="flex items-center space-x-2">
                    <code className="bg-white px-3 py-2 rounded border text-sm font-mono">{session.id}</code>
                    <button
                      onClick={() => navigator.clipboard.writeText(session.id)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
