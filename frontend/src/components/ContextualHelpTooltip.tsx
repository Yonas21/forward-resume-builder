import React, { useEffect, useRef } from 'react';
import { HelpTip } from '../hooks/useContextualHelp';

interface ContextualHelpTooltipProps {
  tip: HelpTip;
  isVisible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  className?: string;
}

export const ContextualHelpTooltip: React.FC<ContextualHelpTooltipProps> = ({
  tip,
  isVisible,
  position,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  className = ''
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Auto-hide after 8 seconds
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 8000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isVisible) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getPriorityColor = () => {
    switch (tip.priority) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getPriorityIcon = () => {
    switch (tip.priority) {
      case 'high':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div
      ref={tooltipRef}
      className={`fixed z-50 max-w-sm bg-white rounded-lg shadow-xl border-2 ${getPriorityColor()} ${className}`}
      style={{
        left: Math.max(10, Math.min(position.x - 160, window.innerWidth - 330)),
        top: Math.max(10, position.y)
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-2">
        <div className="flex items-center space-x-2">
          {getPriorityIcon()}
          <h3 className="font-semibold text-gray-900 text-sm">{tip.title}</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <p className="text-sm text-gray-700 leading-relaxed">{tip.content}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 pb-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500 capitalize">{tip.category}</span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-500 capitalize">{tip.priority} priority</span>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasPrevious && (
            <button
              onClick={onPrevious}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Previous
            </button>
          )}
          
          {hasNext && (
            <button
              onClick={onNext}
              className="text-xs text-blue-600 hover:text-blue-800 transition-colors"
            >
              Next
            </button>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="absolute w-3 h-3 bg-white border-2 border-gray-300 transform rotate-45 -top-1.5 left-1/2 -translate-x-1/2" />
    </div>
  );
};

// Help trigger button component
export const HelpTrigger: React.FC<{
  onClick: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}> = ({ onClick, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center justify-center rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors ${sizeClasses[size]} ${className}`}
      title="Get help"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
};

// Help history component
export const HelpHistory: React.FC<{
  tips: HelpTip[];
  onTipClick: (tip: HelpTip) => void;
  className?: string;
}> = ({ tips, onTipClick, className = '' }) => {
  if (tips.length === 0) {
    return (
      <div className={`text-center py-8 text-gray-500 ${className}`}>
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm">No help tips viewed yet</p>
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h3 className="font-medium text-gray-900 mb-3">Recent Help Tips</h3>
      {tips.slice(-5).reverse().map((tip) => (
        <button
          key={tip.id}
          onClick={() => onTipClick(tip)}
          className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-medium text-gray-900 text-sm">{tip.title}</h4>
              <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tip.content}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
              tip.priority === 'high' ? 'bg-red-100 text-red-700' :
              tip.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {tip.priority}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
};
