import React, { useState, useEffect } from 'react';

export interface ProgressIndicatorProps {
  progress: number; // 0-100
  status?: string;
  title?: string;
  description?: string;
  showPercentage?: boolean;
  showStatus?: boolean;
  variant?: 'linear' | 'circular' | 'steps';
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  animated?: boolean;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  progress,
  status = '',
  title = '',
  description = '',
  showPercentage = true,
  showStatus = true,
  variant = 'linear',
  size = 'md',
  color = 'blue',
  animated = true,
  className = ''
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  // Smooth progress animation
  useEffect(() => {
    if (animated) {
      const timer = setInterval(() => {
        setDisplayProgress(prev => {
          if (prev < progress) {
            return Math.min(prev + 1, progress);
          }
          return prev;
        });
      }, 20);

      return () => clearInterval(timer);
    } else {
      setDisplayProgress(progress);
    }
  }, [progress, animated]);

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'bg-green-500 border-green-500 text-green-600';
      case 'yellow':
        return 'bg-yellow-500 border-yellow-500 text-yellow-600';
      case 'red':
        return 'bg-red-500 border-red-500 text-red-600';
      case 'purple':
        return 'bg-purple-500 border-purple-500 text-purple-600';
      default:
        return 'bg-blue-500 border-blue-500 text-blue-600';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'text-xs';
      case 'lg':
        return 'text-lg';
      default:
        return 'text-sm';
    }
  };

  const renderLinearProgress = () => (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        {title && <span className={`font-medium text-gray-700 ${getSizeClasses()}`}>{title}</span>}
        {showPercentage && (
          <span className={`font-medium ${getColorClasses().split(' ')[2]} ${getSizeClasses()}`}>
            {Math.round(displayProgress)}%
          </span>
        )}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getColorClasses().split(' ')[0]}`}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
      {showStatus && status && (
        <p className="text-xs text-gray-600 mt-1">{status}</p>
      )}
      {description && (
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      )}
    </div>
  );

  const renderCircularProgress = () => {
    const radius = size === 'sm' ? 20 : size === 'lg' ? 40 : 30;
    const strokeWidth = size === 'sm' ? 3 : size === 'lg' ? 6 : 4;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg
            className="transform -rotate-90"
            width={radius * 2 + strokeWidth}
            height={radius * 2 + strokeWidth}
          >
            {/* Background circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke="rgb(229, 231, 235)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress circle */}
            <circle
              cx={radius + strokeWidth / 2}
              cy={radius + strokeWidth / 2}
              r={radius}
              stroke={getColorClasses().split(' ')[0].replace('bg-', '').replace('-500', '') === 'blue' ? '#3B82F6' : '#10B981'}
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-300"
            />
          </svg>
          {showPercentage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold ${getColorClasses().split(' ')[2]} ${getSizeClasses()}`}>
                {Math.round(displayProgress)}%
              </span>
            </div>
          )}
        </div>
        {title && (
          <p className={`font-medium text-gray-700 mt-2 ${getSizeClasses()}`}>{title}</p>
        )}
        {showStatus && status && (
          <p className="text-xs text-gray-600 mt-1">{status}</p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1 text-center">{description}</p>
        )}
      </div>
    );
  };

  const renderStepsProgress = () => {
    const steps = 5;
    const currentStep = Math.ceil((displayProgress / 100) * steps);

    return (
      <div className="w-full">
        {title && (
          <p className={`font-medium text-gray-700 mb-2 ${getSizeClasses()}`}>{title}</p>
        )}
        <div className="flex items-center space-x-2">
          {Array.from({ length: steps }, (_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                i < currentStep ? getColorClasses().split(' ')[0] : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
        {showStatus && status && (
          <p className="text-xs text-gray-600 mt-1">{status}</p>
        )}
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </div>
    );
  };

  const renderProgress = () => {
    switch (variant) {
      case 'circular':
        return renderCircularProgress();
      case 'steps':
        return renderStepsProgress();
      default:
        return renderLinearProgress();
    }
  };

  return (
    <div className={className}>
      {renderProgress()}
    </div>
  );
};

// Loading progress indicator for async operations
export const LoadingProgress: React.FC<{
  isLoading: boolean;
  progress?: number;
  status?: string;
  title?: string;
  onCancel?: () => void;
  className?: string;
}> = ({ 
  isLoading, 
  progress = 0, 
  status = 'Loading...', 
  title = 'Processing',
  onCancel,
  className = ''
}) => {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-xl p-8 max-w-sm mx-4 text-center">
        <ProgressIndicator
          progress={progress}
          status={status}
          title={title}
          variant="circular"
          size="lg"
          color="blue"
          animated={true}
        />
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

// Step-by-step progress indicator
export const StepProgress: React.FC<{
  steps: string[];
  currentStep: number;
  title?: string;
  className?: string;
}> = ({ steps, currentStep, title, className = '' }) => {
  return (
    <div className={className}>
      {title && (
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      )}
      <div className="space-y-3">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
              index < currentStep
                ? 'bg-green-500 text-white'
                : index === currentStep
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-600'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <span className={`text-sm ${
              index <= currentStep ? 'text-gray-900' : 'text-gray-500'
            }`}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// File upload progress indicator
export const FileUploadProgress: React.FC<{
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  onCancel?: () => void;
  className?: string;
}> = ({ fileName, progress, status, onCancel, className = '' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'complete':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'processing':
        return 'text-yellow-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading...';
      case 'processing':
        return 'Processing...';
      case 'complete':
        return 'Complete';
      case 'error':
        return 'Error';
      default:
        return '';
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900 truncate">{fileName}</span>
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      <ProgressIndicator
        progress={progress}
        variant="linear"
        size="sm"
        color={status === 'error' ? 'red' : status === 'complete' ? 'green' : 'blue'}
        showPercentage={false}
        showStatus={false}
      />
      {onCancel && status === 'uploading' && (
        <button
          onClick={onCancel}
          className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
        >
          Cancel
        </button>
      )}
    </div>
  );
};
