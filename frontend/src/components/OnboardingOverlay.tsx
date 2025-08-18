import React, { useEffect, useRef } from 'react';
import { useOnboarding, OnboardingStep } from '../hooks/useOnboarding';

interface OnboardingOverlayProps {
  isActive: boolean;
  currentStep: OnboardingStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  currentStepIndex: number;
  totalSteps: number;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  isActive,
  currentStep,
  onNext,
  onPrevious,
  onSkip,
  currentStepIndex,
  totalSteps,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !currentStep) return;

    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return;

    const targetRect = targetElement.getBoundingClientRect();
    const tooltip = tooltipRef.current;
    if (!tooltip) return;

    // Position tooltip based on the step position
    const tooltipRect = tooltip.getBoundingClientRect();
    let top = 0;
    let left = 0;

    switch (currentStep.position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + 10;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - 10;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + 10;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 10) left = 10;
    if (left + tooltipRect.width > viewportWidth - 10) {
      left = viewportWidth - tooltipRect.width - 10;
    }
    if (top < 10) top = 10;
    if (top + tooltipRect.height > viewportHeight - 10) {
      top = viewportHeight - tooltipRect.height - 10;
    }

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;

    // Add highlight to target element
    targetElement.classList.add('onboarding-highlight');
    
    return () => {
      targetElement.classList.remove('onboarding-highlight');
    };
  }, [isActive, currentStep]);

  if (!isActive) return null;

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
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">
            Step {currentStepIndex + 1} of {totalSteps}
          </span>
          <button
            onClick={onSkip}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            Skip
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-gray-900 mb-2">
          {currentStep.title}
        </h3>

        {/* Content */}
        <p className="text-gray-600 text-sm mb-4">
          {currentStep.content}
        </p>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
            className={`px-3 py-1 text-sm rounded ${
              currentStepIndex === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            Previous
          </button>

          <button
            onClick={onNext}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
          >
            {currentStepIndex === totalSteps - 1 ? 'Finish' : 'Next'}
          </button>
        </div>

        {/* Arrow indicator */}
        <div className="absolute w-3 h-3 bg-white border border-gray-200 transform rotate-45" />
      </div>

      <style jsx>{`
        .onboarding-highlight {
          position: relative;
          z-index: 51;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};
