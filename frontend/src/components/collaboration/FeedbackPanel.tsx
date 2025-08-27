import React, { useState } from 'react';
import type { Feedback, FeedbackReply } from '../../hooks/useFeedback';

interface FeedbackPanelProps {
  feedback: Feedback[];
  feedbackStats: any;
  onAddFeedback: (feedbackData: any) => Promise<Feedback>;
  onUpdateFeedbackStatus: (feedbackId: string, status: 'pending' | 'reviewed' | 'implemented' | 'dismissed', resolvedBy?: string) => Promise<void>;
  onAddReply: (feedbackId: string, replyData: any) => Promise<FeedbackReply>;
  onShowFeedbackForm: () => void;
  isLoading?: boolean;
  className?: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback, feedbackStats, onUpdateFeedbackStatus, onAddReply, onShowFeedbackForm, className = ''
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);

  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'implemented' | 'dismissed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'author'>('date');

  const filteredFeedback = feedback.filter(f => filter === 'all' || f.status === filter).sort((a, b) => {
    switch (sortBy) {
      case 'date':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'priority':
        const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      case 'status':
        return a.status.localeCompare(b.status);
      case 'author':
        return a.authorName.localeCompare(b.authorName);
      default:
        return 0;
    }
  });

  const handleAddReply = async (feedbackId: string) => {
    if (!replyContent.trim()) return;
    
    try {
      await onAddReply(feedbackId, {
        content: replyContent,
        authorName: 'You',
        authorRole: 'owner'
      });
      setReplyContent('');
    } catch (error) {
      console.error('Failed to add reply:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, status: string) => {
    try {
      await onUpdateFeedbackStatus(feedbackId, status as 'pending' | 'reviewed' | 'implemented' | 'dismissed');
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'implemented': return 'bg-green-100 text-green-800';
      case 'dismissed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorRoleColor = (role: string) => {
    switch (role) {
      case 'mentor': return 'bg-purple-100 text-purple-800';
      case 'recruiter': return 'bg-blue-100 text-blue-800';
      case 'colleague': return 'bg-green-100 text-green-800';
      case 'friend': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header with stats and request feedback button */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
            <p className="text-sm text-gray-600">Collect and manage feedback from mentors and colleagues</p>
          </div>
          <button
            onClick={onShowFeedbackForm}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Feedback
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{feedbackStats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{feedbackStats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{feedbackStats.implemented}</div>
            <div className="text-sm text-gray-600">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{feedbackStats.avgRating}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Filter:</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="implemented">Implemented</option>
              <option value="dismissed">Dismissed</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
              <option value="author">Author</option>
            </select>
          </div>
        </div>
      </div>

      {/* Feedback List */}
      {filteredFeedback.length === 0 ? (
        <div className="p-6 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
          <p className="text-gray-600 mb-4">Request feedback from mentors and colleagues to improve your resume</p>
          <button
            onClick={onShowFeedbackForm}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Request Feedback
          </button>
        </div>
      ) : (
        <div className="divide-y">
          {filteredFeedback.map((item) => (
            <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedFeedback(item)}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="font-medium text-gray-900">{item.title}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority}
                    </span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full ${getAuthorRoleColor(item.authorRole)}`}>
                      {item.authorName} ({item.authorRole})
                    </span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.rating && (
                      <span className="flex items-center">
                        {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                      </span>
                    )}
                    {item.replies.length > 0 && (
                      <span>{item.replies.length} replies</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feedback Detail */}
      {selectedFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">{selectedFeedback.title}</h3>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-2 mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(selectedFeedback.priority)}`}>
                    {selectedFeedback.priority}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedFeedback.status)}`}>
                    {selectedFeedback.status}
                  </span>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAuthorRoleColor(selectedFeedback.authorRole)}`}>
                    {selectedFeedback.authorName} ({selectedFeedback.authorRole})
                  </span>
                </div>
                
                <p className="text-gray-700 mb-4">{selectedFeedback.content}</p>
                
                {selectedFeedback.suggestions && selectedFeedback.suggestions.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                      {selectedFeedback.suggestions.map((suggestion, index) => (
                        <li key={index}>{suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{formatDate(selectedFeedback.createdAt)}</span>
                  {selectedFeedback.rating && (
                    <span className="flex items-center">
                      Rating: {'★'.repeat(selectedFeedback.rating)}{'☆'.repeat(5 - selectedFeedback.rating)}
                    </span>
                  )}
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedFeedback.status}
                    onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="implemented">Implemented</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              {/* Replies */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Replies ({selectedFeedback.replies.length})</h4>
                <div className="space-y-3">
                  {selectedFeedback.replies.map((reply, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{reply.authorName}</span>
                        <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700">{reply.content}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Reply */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Add Reply</h4>
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex items-center justify-end space-x-2 mt-2">
                  <button
                    onClick={() => setReplyContent('')}
                    className="px-3 py-1 text-gray-600 text-sm hover:text-gray-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleAddReply(selectedFeedback.id)}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
