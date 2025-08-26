import { useState, useEffect, useCallback } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: () => void;
  skipIf?: () => boolean;
}

export interface OnboardingConfig {
  id: string;
  title: string;
  description: string;
  steps: OnboardingStep[];
  autoStart?: boolean;
  showProgress?: boolean;
  allowSkip?: boolean;
}

export const useOnboarding = (config?: OnboardingConfig) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const defaultConfig: OnboardingConfig = {
    id: 'resume-builder-onboarding',
    title: 'Resume Builder Tutorial',
    description: 'Learn how to create your perfect resume',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Resume Builder!',
        content: 'Let\'s create your professional resume in just a few steps. This tutorial will show you around.',
        target: '.resume-builder-container',
        position: 'bottom'
      },
      {
        id: 'personal-info',
        title: 'Personal Information',
        content: 'Start by filling in your personal details. This section appears at the top of your resume.',
        target: '[data-section="personal"]',
        position: 'right'
      },
      {
        id: 'summary',
        title: 'Professional Summary',
        content: 'Write a compelling summary that highlights your key strengths and career objectives.',
        target: '[data-section="summary"]',
        position: 'right'
      },
      {
        id: 'experience',
        title: 'Work Experience',
        content: 'Add your work history with detailed descriptions of your responsibilities and achievements.',
        target: '[data-section="experience"]',
        position: 'right'
      },
      {
        id: 'skills',
        title: 'Skills Section',
        content: 'Showcase your technical and soft skills. You can categorize them for better organization.',
        target: '[data-section="skills"]',
        position: 'right'
      },
      {
        id: 'preview',
        title: 'Preview & Customize',
        content: 'See how your resume looks and customize the template, colors, and layout.',
        target: '.preview-section',
        position: 'left'
      },
      {
        id: 'export',
        title: 'Export Your Resume',
        content: 'Download your resume as PDF or share it directly with employers.',
        target: '.export-section',
        position: 'top'
      }
    ],
    autoStart: true,
    showProgress: true,
    allowSkip: true
  };

  const finalConfig = config || defaultConfig;
  const currentStep = finalConfig.steps[currentStepIndex];

  // Check if onboarding has been completed before
  useEffect(() => {
    const completed = localStorage.getItem(`onboarding-${finalConfig.id}-completed`);
    if (completed === 'true') {
      setHasCompleted(true);
    }
  }, [finalConfig.id]);

  // Auto-start onboarding for new users
  useEffect(() => {
    if (finalConfig.autoStart && !hasCompleted && !isActive) {
      const timer = setTimeout(() => {
        start();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [finalConfig.autoStart, hasCompleted, isActive]);

  const start = useCallback(() => {
    setIsActive(true);
    setCurrentStepIndex(0);
    setIsPaused(false);
  }, []);

  const next = useCallback(() => {
    if (currentStepIndex < finalConfig.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      complete();
    }
  }, [currentStepIndex, finalConfig.steps.length]);

  const previous = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const skip = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(`onboarding-${finalConfig.id}-completed`, 'true');
  }, [finalConfig.id]);

  const complete = useCallback(() => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(`onboarding-${finalConfig.id}-completed`, 'true');
  }, [finalConfig.id]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  const reset = useCallback(() => {
    localStorage.removeItem(`onboarding-${finalConfig.id}-completed`);
    setHasCompleted(false);
    setCurrentStepIndex(0);
    setIsActive(false);
    setIsPaused(false);
  }, [finalConfig.id]);

  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < finalConfig.steps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [finalConfig.steps.length]);

  const getProgress = useCallback(() => {
    return {
      current: currentStepIndex + 1,
      total: finalConfig.steps.length,
      percentage: Math.round(((currentStepIndex + 1) / finalConfig.steps.length) * 100)
    };
  }, [currentStepIndex, finalConfig.steps.length]);

  return {
    // State
    isActive,
    isPaused,
    hasCompleted,
    currentStep,
    currentStepIndex,
    totalSteps: finalConfig.steps.length,
    config: finalConfig,
    
    // Actions
    start,
    next,
    previous,
    skip,
    complete,
    pause,
    resume,
    reset,
    goToStep,
    
    // Computed
    getProgress,
    canGoNext: currentStepIndex < finalConfig.steps.length - 1,
    canGoPrevious: currentStepIndex > 0,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === finalConfig.steps.length - 1
  };
};
