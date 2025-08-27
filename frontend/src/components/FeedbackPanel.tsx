import React, { useState } from 'react';
import type { Feedback, FeedbackReply } from '../hooks/useFeedback';

interface FeedbackPanelProps {
  feedback: Feedback[];
  feedbackStats: any;
  onUpdateFeedbackStatus: (feedbackId: string, status: string, resolvedBy?: string) => Promise<void>;
  onAddReply: (feedbackId: string, replyData: any) => Promise<FeedbackReply>;
  onShowFeedbackForm: () => void;
  className?: string;
}

export const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  feedback,
  feedbackStats,
  onUpdateFeedbackStatus,
  onAddReply,
  onShowFeedbackForm,
  className = ''
}) => {
  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'reviewed' | 'implemented' | 'dismissed'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'status' | 'author'>('date');

  const filteredFeedback = feedback.filter(f => 
    filter === 'all' || f.status === filter
  ).sort((a, b) => {
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
        feedbackId,
        authorId: 'current-user',
        authorName: 'You',
        content: replyContent,
        isResolved: false
      });
      setReplyContent('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  };

  const handleStatusUpdate = async (feedbackId: string, status: string) => {
    try {
      await onUpdateFeedbackStatus(feedbackId, status as any, 'current-user');
    } catch (error) {
      console.error('Error updating status:', error);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      case 'implemented':
        return 'bg-green-100 text-green-800';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAuthorRoleColor = (role: string) => {
    switch (role) {
      case 'mentor':
        return 'bg-purple-100 text-purple-800';
      case 'recruiter':
        return 'bg-blue-100 text-blue-800';
      case 'colleague':
        return 'bg-green-100 text-green-800';
      case 'friend':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
          <button
            onClick={onShowFeedbackForm}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                         disabled={false}
          >
            Request Feedback
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{feedbackStats.totalFeedback}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{feedbackStats.pendingFeedback}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{feedbackStats.implementedFeedback}</div>
            <div className="text-sm text-gray-600">Implemented</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{feedbackStats.averageRating.toFixed(1)}</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 mt-4">
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
      <div className="max-h-96 overflow-y-auto">
        {filteredFeedback.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p>No feedback available</p>
            <p className="text-sm">Request feedback to get started</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredFeedback.map((item) => (
              <div
                key={item.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedFeedback?.id === item.id ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFeedback(item)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-gray-900">{item.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(item.priority)}`}>
                        {item.priority}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${getAuthorRoleColor(item.authorRole)}`}>
                        {item.authorRole}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.content}</p>

                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>By {item.authorName}</span>
                      <span>{formatDate(item.createdAt)}</span>
                      {item.section && <span>Section: {item.section}</span>}
                      {item.rating && (
                        <span className="flex items-center">
                          {item.rating} ★
                        </span>
                      )}
                      {item.replies.length > 0 && (
                        <span>{item.replies.length} replies</span>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    <select
                      value={item.status}
                      onChange={(e) => handleStatusUpdate(item.id, e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewed">Reviewed</option>
                      <option value="implemented">Implemented</option>
                      <option value="dismissed">Dismissed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Detail */}
      {selectedFeedback && (
        <div className="border-t bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">{selectedFeedback.title}</h4>
            <button
              onClick={() => setSelectedFeedback(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(selectedFeedback.priority)}`}>
                {selectedFeedback.priority}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(selectedFeedback.status)}`}>
                {selectedFeedback.status}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full ${getAuthorRoleColor(selectedFeedback.authorRole)}`}>
                {selectedFeedback.authorRole}
              </span>
            </div>

            <p className="text-sm text-gray-700 mb-3">{selectedFeedback.content}</p>

            {selectedFeedback.suggestions && selectedFeedback.suggestions.length > 0 && (
              <div className="mb-3">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Suggestions:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {selectedFeedback.suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-gray-500">
              <p>By {selectedFeedback.authorName} on {formatDate(selectedFeedback.createdAt)}</p>
              {selectedFeedback.section && <p>Section: {selectedFeedback.section}</p>}
              {selectedFeedback.rating && <p>Rating: {selectedFeedback.rating}/5 stars</p>}
            </div>
          </div>

          {/* Replies */}
          {selectedFeedback.replies.length > 0 && (
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-900 mb-2">Replies:</h5>
              <div className="space-y-2">
                {selectedFeedback.replies.map((reply) => (
                  <div key={reply.id} className="bg-white rounded-lg p-3 border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900">{reply.authorName}</span>
                      <span className="text-xs text-gray-500">{formatDate(reply.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600">{reply.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Reply */}
          <div>
            {showReplyForm ? (
              <div className="space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  rows={3}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleAddReply(selectedFeedback.id)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    Send Reply
                  </button>
                  <button
                    onClick={() => setShowReplyForm(false)}
                    className="px-3 py-1 text-gray-600 text-sm rounded hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowReplyForm(true)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Add Reply
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
