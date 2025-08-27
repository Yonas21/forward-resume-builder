import React, { useEffect, useRef, useState } from 'react';
import type { OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  isActive: boolean;
  currentStep: OnboardingStep | undefined;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
  onPause?: () => void;
  onResume?: () => void;
  isPaused?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  currentStepIndex,
  totalSteps,
  onPause,
  onResume,
  isPaused = false,
  showProgress = true,
  allowSkip = true
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const targetElement = document.querySelector(currentStep.target) as HTMLElement;
    if (!targetElement) return;

    // Add highlight to target element
    targetElement.classList.add('onboarding-highlight');
    
    // Calculate tooltip position
    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320; // Approximate tooltip width
    const tooltipHeight = 200; // Approximate tooltip height
    
    let x = 0;
    let y = 0;
    
    switch (currentStep.position) {
      case 'top':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.top - tooltipHeight - 20;
        break;
      case 'bottom':
        x = rect.left + rect.width / 2 - tooltipWidth / 2;
        y = rect.bottom + 20;
        break;
      case 'left':
        x = rect.left - tooltipWidth - 20;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
      case 'right':
        x = rect.right + 20;
        y = rect.top + rect.height / 2 - tooltipHeight / 2;
        break;
    }
    
    // Ensure tooltip stays within viewport
    x = Math.max(20, Math.min(x, window.innerWidth - tooltipWidth - 20));
    y = Math.max(20, Math.min(y, window.innerHeight - tooltipHeight - 20));
    
    setTooltipPosition({ x, y });
    
    // Scroll target element into view
    targetElement.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center',
      inline: 'center'
    });
    
    return () => {
      targetElement.classList.remove('onboarding-highlight');
    };
  }, [isActive, currentStep]);

  if (!isActive || !currentStep) return null;

  const progress = showProgress ? {
    current: currentStepIndex + 1,
    total: totalSteps,
    percentage: Math.round(((currentStepIndex + 1) / totalSteps) * 100)
  } : null;

  return (
    <>
      {/* Backdrop */}
      <div 
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onSkip}
      />
      
      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 max-w-sm p-4"
        style={{
          left: tooltipPosition.x,
          top: tooltipPosition.y,
          transform: 'translate(0, 0)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator */}
        {progress && (
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">
                Step {progress.current} of {progress.total}
              </span>
              <div className="w-16 bg-gray-200 rounded-full h-1">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
            {allowSkip && (
              <button
                onClick={onSkip}
                className="text-gray-400 hover:text-gray-600 text-sm"
              >
                Skip
              </button>
            )}
          </div>
        )}

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2">
          {currentStep.title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 text-sm mb-4 leading-relaxed">
          {currentStep.content}
        </p>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {onPause && onResume && (
              <button
                onClick={isPaused ? onResume : onPause}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            )}
            <button
              onClick={onPrevious}
              disabled={currentStepIndex === 0}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentStepIndex === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-blue-600 hover:text-blue-800'
              }`}
            >
              Previous
            </button>
          </div>

          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Arrow indicator */}
        <div 
          className={`absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45 ${
            currentStep.position === 'top' ? 'bottom-[-6px] left-1/2 -translate-x-1/2' :
            currentStep.position === 'bottom' ? 'top-[-6px] left-1/2 -translate-x-1/2' :
            currentStep.position === 'left' ? 'right-[-6px] top-1/2 -translate-y-1/2' :
            'left-[-6px] top-1/2 -translate-y-1/2'
          }`}
        />
      </div>
    </>
  );
};

// Onboarding trigger button component
export const OnboardingTrigger: React.FC<{
  onStart: () => void;
  className?: string;
}> = ({ onStart, className = '' }) => {
  return (
    <button
      onClick={onStart}
      className={`inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors ${className}`}
    >
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      Show Tutorial
    </button>
  );
};
