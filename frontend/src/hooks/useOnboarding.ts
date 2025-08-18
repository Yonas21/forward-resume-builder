import { useState, useEffect } from 'react';

export interface OnboardingStep {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'bottom' | 'left' | 'right';
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
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
];

export const useOnboarding = () => {
  const [isOnboardingActive, setIsOnboardingActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem('onboardingCompleted');
    if (onboardingCompleted === 'true') {
      setHasCompletedOnboarding(true);
    }
  }, []);

  const startOnboarding = () => {
    setIsOnboardingActive(true);
    setCurrentStepIndex(0);
  };

  const nextStep = () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      completeOnboarding();
    }
  };

  const previousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    setIsOnboardingActive(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  const resetOnboarding = () => {
    localStorage.removeItem('onboardingCompleted');
    setHasCompletedOnboarding(false);
    setCurrentStepIndex(0);
  };

  return {
    isOnboardingActive,
    currentStepIndex,
    currentStep: ONBOARDING_STEPS[currentStepIndex],
    hasCompletedOnboarding,
    totalSteps: ONBOARDING_STEPS.length,
    startOnboarding,
    nextStep,
    previousStep,
    skipOnboarding,
    completeOnboarding,
    resetOnboarding,
  };
};
