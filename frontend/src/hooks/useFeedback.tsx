import { useState, useCallback } from 'react';

export interface Feedback {
  id: string;
  resumeId: string;
  authorId: string;
  authorName: string;
  authorRole: 'mentor' | 'recruiter' | 'colleague' | 'friend' | 'other';
  section?: string;
  type: 'general' | 'content' | 'formatting' | 'suggestion' | 'correction';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewed' | 'implemented' | 'dismissed';
  title: string;
  content: string;
  suggestions?: string[];
  rating?: number; // 1-5 stars
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  tags: string[];
  isPublic: boolean;
  replies: FeedbackReply[];
}

export interface FeedbackReply {
  id: string;
  feedbackId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: Date;
  isResolved: boolean;
}

export interface FeedbackTemplate {
  id: string;
  name: string;
  description: string;
  category: 'content' | 'formatting' | 'structure' | 'general';
  questions: FeedbackQuestion[];
  isDefault: boolean;
}

export interface FeedbackQuestion {
  id: string;
  question: string;
  type: 'text' | 'rating' | 'multiple-choice' | 'yes-no';
  required: boolean;
  options?: string[];
  placeholder?: string;
}

export interface FeedbackStats {
  totalFeedback: number;
  pendingFeedback: number;
  implementedFeedback: number;
  averageRating: number;
  feedbackBySection: Record<string, number>;
  feedbackByType: Record<string, number>;
  recentActivity: FeedbackActivity[];
}

export interface FeedbackActivity {
  id: string;
  type: 'feedback-added' | 'feedback-resolved' | 'rating-given' | 'reply-added';
  feedbackId: string;
  userId: string;
  userName: string;
  timestamp: Date;
  details: string;
}

export const useFeedback = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [feedbackStats, setFeedbackStats] = useState<FeedbackStats>({
    totalFeedback: 0,
    pendingFeedback: 0,
    implementedFeedback: 0,
    averageRating: 0,
    feedbackBySection: {},
    feedbackByType: {},
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Predefined feedback templates
  const feedbackTemplates: FeedbackTemplate[] = [
    {
      id: 'general-review',
      name: 'General Resume Review',
      description: 'Comprehensive review covering content, formatting, and overall impact',
      category: 'general',
      isDefault: true,
      questions: [
        {
          id: 'overall-impression',
          question: 'What is your overall impression of this resume?',
          type: 'rating',
          required: true,
          placeholder: 'Rate from 1-5 stars'
        },
        {
          id: 'strengths',
          question: 'What are the main strengths of this resume?',
          type: 'text',
          required: true,
          placeholder: 'List the key strengths...'
        },
        {
          id: 'improvements',
          question: 'What areas need improvement?',
          type: 'text',
          required: true,
          placeholder: 'Suggest specific improvements...'
        },
        {
          id: 'clarity',
          question: 'Is the content clear and easy to understand?',
          type: 'yes-no',
          required: true
        },
        {
          id: 'target-role',
          question: 'Is this resume well-suited for the target role?',
          type: 'yes-no',
          required: true
        }
      ]
    },
    {
      id: 'content-review',
      name: 'Content Review',
      description: 'Focus on the content quality and relevance',
      category: 'content',
      isDefault: false,
      questions: [
        {
          id: 'achievements',
          question: 'Are achievements properly quantified and impactful?',
          type: 'rating',
          required: true
        },
        {
          id: 'keywords',
          question: 'Are relevant keywords and skills included?',
          type: 'yes-no',
          required: true
        },
        {
          id: 'experience-description',
          question: 'How would you rate the experience descriptions?',
          type: 'rating',
          required: true
        },
        {
          id: 'content-suggestions',
          question: 'What content would you add or remove?',
          type: 'text',
          required: false,
          placeholder: 'Suggest content changes...'
        }
      ]
    },
    {
      id: 'formatting-review',
      name: 'Formatting Review',
      description: 'Focus on visual presentation and formatting',
      category: 'formatting',
      isDefault: false,
      questions: [
        {
          id: 'layout',
          question: 'How would you rate the overall layout and design?',
          type: 'rating',
          required: true
        },
        {
          id: 'readability',
          question: 'Is the resume easy to read and scan?',
          type: 'yes-no',
          required: true
        },
        {
          id: 'consistency',
          question: 'Is the formatting consistent throughout?',
          type: 'yes-no',
          required: true
        },
        {
          id: 'formatting-suggestions',
          question: 'What formatting improvements would you suggest?',
          type: 'text',
          required: false,
          placeholder: 'Suggest formatting changes...'
        }
      ]
    }
  ];

  // Add new feedback
  const addFeedback = useCallback(async (feedbackData: Omit<Feedback, 'id' | 'createdAt' | 'updatedAt' | 'replies'>): Promise<Feedback> => {
    setIsLoading(true);
    try {
      const newFeedback: Feedback = {
        ...feedbackData,
        id: `feedback_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        replies: []
      };

      setFeedback(prev => [...prev, newFeedback]);
      updateFeedbackStats([...feedback, newFeedback]);

      // Add activity
      addFeedbackActivity({
        type: 'feedback-added',
        feedbackId: newFeedback.id,
        userId: newFeedback.authorId,
        userName: newFeedback.authorName,
        details: `Added ${newFeedback.type} feedback`
      });

      return newFeedback;
    } catch (error) {
      console.error('Error adding feedback:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [feedback]);

  // Update feedback status
  const updateFeedbackStatus = useCallback(async (feedbackId: string, status: Feedback['status'], resolvedBy?: string): Promise<void> => {
    setIsLoading(true);
    try {
      setFeedback(prev => prev.map(f => {
        if (f.id === feedbackId) {
          const updated = {
            ...f,
            status,
            updatedAt: new Date(),
            resolvedAt: status === 'implemented' || status === 'dismissed' ? new Date() : f.resolvedAt,
            resolvedBy: status === 'implemented' || status === 'dismissed' ? resolvedBy : f.resolvedBy
          };

          // Add activity
          addFeedbackActivity({
            type: 'feedback-resolved',
            feedbackId: f.id,
            userId: resolvedBy || 'current-user',
            userName: 'You',
            details: `Marked feedback as ${status}`
          });

          return updated;
        }
        return f;
      }));

      // Update stats after state change
      setTimeout(() => {
        const updatedFeedback = feedback.map(f => 
          f.id === feedbackId 
            ? { ...f, status, resolvedAt: status === 'implemented' || status === 'dismissed' ? new Date() : f.resolvedAt }
            : f
        );
        updateFeedbackStats(updatedFeedback);
      }, 0);

    } catch (error) {
      console.error('Error updating feedback status:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [feedback]);

  // Add reply to feedback
  const addReply = useCallback(async (feedbackId: string, replyData: Omit<FeedbackReply, 'id' | 'createdAt'>): Promise<FeedbackReply> => {
    setIsLoading(true);
    try {
      const newReply: FeedbackReply = {
        ...replyData,
        id: `reply_${Date.now()}`,
        createdAt: new Date()
      };

      setFeedback(prev => prev.map(f => {
        if (f.id === feedbackId) {
          return {
            ...f,
            replies: [...f.replies, newReply],
            updatedAt: new Date()
          };
        }
        return f;
      }));

      // Add activity
      addFeedbackActivity({
        type: 'reply-added',
        feedbackId,
        userId: replyData.authorId,
        userName: replyData.authorName,
        details: 'Added a reply to feedback'
      });

      return newReply;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get feedback by section
  const getFeedbackBySection = useCallback((section?: string): Feedback[] => {
    if (!section) return feedback;
    return feedback.filter(f => f.section === section);
  }, [feedback]);

  // Get feedback by status
  const getFeedbackByStatus = useCallback((status: Feedback['status']): Feedback[] => {
    return feedback.filter(f => f.status === status);
  }, [feedback]);

  // Get feedback by priority
  const getFeedbackByPriority = useCallback((priority: Feedback['priority']): Feedback[] => {
    return feedback.filter(f => f.priority === priority);
  }, [feedback]);

  // Update feedback stats
  const updateFeedbackStats = useCallback((feedbackList: Feedback[]) => {
    const totalFeedback = feedbackList.length;
    const pendingFeedback = feedbackList.filter(f => f.status === 'pending').length;
    const implementedFeedback = feedbackList.filter(f => f.status === 'implemented').length;
    
    const ratings = feedbackList.filter(f => f.rating).map(f => f.rating!);
    const averageRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

    const feedbackBySection: Record<string, number> = {};
    const feedbackByType: Record<string, number> = {};

    feedbackList.forEach(f => {
      if (f.section) {
        feedbackBySection[f.section] = (feedbackBySection[f.section] || 0) + 1;
      }
      feedbackByType[f.type] = (feedbackByType[f.type] || 0) + 1;
    });

    setFeedbackStats({
      totalFeedback,
      pendingFeedback,
      implementedFeedback,
      averageRating,
      feedbackBySection,
      feedbackByType,
      recentActivity: feedbackStats.recentActivity
    });
  }, [feedbackStats.recentActivity]);

  // Add feedback activity
  const addFeedbackActivity = useCallback((activity: Omit<FeedbackActivity, 'id' | 'timestamp'>) => {
    const newActivity: FeedbackActivity = {
      ...activity,
      id: `activity_${Date.now()}`,
      timestamp: new Date()
    };

    setFeedbackStats(prev => ({
      ...prev,
      recentActivity: [newActivity, ...prev.recentActivity.slice(0, 9)] // Keep last 10
    }));
  }, []);

  // Get feedback templates
  const getFeedbackTemplates = useCallback((): FeedbackTemplate[] => {
    return feedbackTemplates;
  }, []);

  // Get default feedback template
  const getDefaultTemplate = useCallback((): FeedbackTemplate | null => {
    return feedbackTemplates.find(t => t.isDefault) || null;
  }, []);

  // Calculate feedback score
  const calculateFeedbackScore = useCallback((): number => {
    if (feedback.length === 0) return 0;
    
    const scores = feedback.map(f => {
      if (f.status === 'implemented') return 100;
      if (f.status === 'reviewed') return 75;
      if (f.status === 'pending') return 25;
      return 0;
    });

    return scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
  }, [feedback]);

  return {
    // State
    feedback,
    feedbackStats,
    isLoading,
    
    // Actions
    addFeedback,
    updateFeedbackStatus,
    addReply,
    
    // Queries
    getFeedbackBySection,
    getFeedbackByStatus,
    getFeedbackByPriority,
    getFeedbackTemplates,
    getDefaultTemplate,
    
    // Utilities
    calculateFeedbackScore,
    
    // Constants
    feedbackTemplates
  };
};
