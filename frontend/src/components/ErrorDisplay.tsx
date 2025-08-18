import React from 'react';
import { ErrorInfo } from '../hooks/useErrorHandler';

interface ErrorDisplayProps {
  errors: ErrorInfo[];
  onRemove: (id: string) => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  errors, 
  onRemove, 
  className = '' 
}) => {
  if (errors.length === 0) return null;

  const getErrorIcon = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  const getErrorColor = (type: ErrorInfo['type']) => {
    switch (type) {
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-800';
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-800';
      default:
        return 'border-red-200 bg-red-50 text-red-800';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {errors.map((error) => (
        <div
          key={error.id}
          className={`flex items-start p-3 rounded-md border ${getErrorColor(error.type)}`}
        >
          <span className="mr-2 mt-0.5">{getErrorIcon(error.type)}</span>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{error.message}</p>
            <p className="text-xs opacity-75 mt-1">
              {error.timestamp.toLocaleTimeString()}
            </p>
          </div>

          <div className="flex items-center space-x-2 ml-2">
            {error.action && (
              <button
                onClick={error.action.handler}
                className="text-xs px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
              >
                {error.action.label}
              </button>
            )}
            
            <button
              onClick={() => onRemove(error.id)}
              className="text-xs px-2 py-1 rounded bg-white bg-opacity-50 hover:bg-opacity-75 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
