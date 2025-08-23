import React, { useEffect, useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { templates } from '../components/TemplateConfig';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { LeftSidebar } from '../components/builder/LeftSidebar';
import { RightSidebar } from '../components/builder/RightSidebar';
import { Header } from '../components/builder/Header';
import { MainContent } from '../components/builder/MainContent';
import { useAiSummary } from '../hooks/useAiSummary';
import { useAutoSave } from '../hooks/useAutoSave';
import { useOnboarding } from '../hooks/useOnboarding';
import { useErrorHandler } from '../hooks/useErrorHandler';
import { AutoSaveIndicator } from '../components/AutoSaveIndicator';
import { OnboardingOverlay } from '../components/OnboardingOverlay';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ResumeScoring } from '../components/ResumeScoring';
import { AdvancedFormatting } from '../components/builder/AdvancedFormatting';

const ResumeBuilder: React.FC = () => {
  const {
    resume,
    fetchMyResume,
    updateSectionOrder,
  } = useResumeStore();

  // Initialize hooks
  useAutoSave();
  const onboarding = useOnboarding();
  const errorHandler = useErrorHandler();

  useEffect(() => {
    fetchMyResume();
  }, [fetchMyResume]);

  const [font, setFont] = useState('font-sans');
  const [color, setColor] = useState('#2563eb');
  const [selectedTemplate, setSelectedTemplate] = useState('basic');
  const [activeSection, setActiveSection] = useState('personal');
  const [zoom, setZoom] = useState(95); // percent
  const [pagePadding, setPagePadding] = useState<number>(() => {
    const stored = localStorage.getItem('pagePaddingPx');
    return stored ? parseInt(stored, 10) : 32;
  });
  const [showGrid, setShowGrid] = useState<boolean>(() => {
    return localStorage.getItem('showGridOverlay') === 'true';
  });
  
  // Advanced formatting options
  const [fontSize, setFontSize] = useState('text-base');
  const [lineHeight, setLineHeight] = useState('leading-normal');
  const [spacing, setSpacing] = useState('normal');
  const [alignment, setAlignment] = useState('left');
  const [showBorders, setShowBorders] = useState(false);
  const [showShadows, setShowShadows] = useState(false);
  const [sectionOrder, setSectionOrder] = useState([
    'personal',
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certifications'
  ]);

  const { generateAiSummary, isAiLoading } = useAiSummary();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  useEffect(() => {
    const storedTemplate = localStorage.getItem('selectedTemplate');
    const storedSectionOrder = localStorage.getItem('sectionOrder');
    const storedFont = localStorage.getItem('resumeFont') || localStorage.getItem('selectedFont');
    const storedColor = localStorage.getItem('resumeColor') || localStorage.getItem('selectedColor');
    
    if (storedTemplate) {
      setSelectedTemplate(storedTemplate);
    }
    
    if (storedSectionOrder) {
      setSectionOrder(JSON.parse(storedSectionOrder));
    }

    if (storedFont) setFont(storedFont);
    if (storedColor) setColor(storedColor);
  }, []);

  // Load section order from resume when it's fetched
  useEffect(() => {
    if (resume?.section_order && resume.section_order.length > 0) {
      setSectionOrder(resume.section_order);
    }
  }, [resume?.section_order]);

  useEffect(() => {
    localStorage.setItem('pagePaddingPx', String(pagePadding));
  }, [pagePadding]);

  useEffect(() => {
    localStorage.setItem('showGridOverlay', showGrid ? 'true' : 'false');
  }, [showGrid]);

  // Save section order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
  }, [sectionOrder]);

  // Drag and drop handlers
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over?.id as string);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Save section order to backend
        updateSectionOrder(newOrder);
        
        return newOrder;
      });
    }
  };

  const renderTemplatePreview = () => {
    const template = templates.find(t => t.id === selectedTemplate);
    if (!template || !resume) return null;

    return React.createElement(template.component, {
      resume: resume,
      color,
      font,
      sectionOrder,
      fontSize,
      lineHeight,
      spacing,
      alignment,
      showBorders,
      showShadows
    });
  };

  // Keep default focus outlines for accessibility (do not disable)

  if (!resume) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resume...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 resume-builder-container">
      <Header selectedTemplate={selectedTemplate} font={font} color={color} />

      {/* Auto-save indicator */}
      <div className="fixed top-20 right-4 z-30">
        <AutoSaveIndicator />
      </div>

      {/* Error display */}
      <div className="fixed top-24 left-4 z-30 max-w-md">
        <ErrorDisplay 
          errors={errorHandler.errors} 
          onRemove={errorHandler.removeError} 
        />
      </div>

      {/* Onboarding overlay */}
      <OnboardingOverlay
        isActive={onboarding.isOnboardingActive}
        currentStep={onboarding.currentStep}
        onNext={onboarding.nextStep}
        onPrevious={onboarding.previousStep}
        onSkip={onboarding.skipOnboarding}
        currentStepIndex={onboarding.currentStepIndex}
        totalSteps={onboarding.totalSteps}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <LeftSidebar
              selectedTemplate={selectedTemplate}
              setSelectedTemplate={setSelectedTemplate}
              font={font}
              setFont={setFont}
              color={color}
              setColor={setColor}
              sectionOrder={sectionOrder}
              handleDragEnd={handleDragEnd}
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              sensors={sensors}
              onStartOnboarding={onboarding.startOnboarding}
              hasCompletedOnboarding={onboarding.hasCompletedOnboarding}
            />
            
            <AdvancedFormatting
              font={font}
              setFont={setFont}
              color={color}
              setColor={setColor}
              fontSize={fontSize}
              setFontSize={setFontSize}
              lineHeight={lineHeight}
              setLineHeight={setLineHeight}
              spacing={spacing}
              setSpacing={setSpacing}
              alignment={alignment}
              setAlignment={setAlignment}
              showBorders={showBorders}
              setShowBorders={setShowBorders}
              showShadows={showShadows}
              setShowShadows={setShowShadows}
            />
          </div>

          <MainContent
            activeSection={activeSection}
            generateAiSummary={generateAiSummary}
            isAiLoading={isAiLoading}
          />

          <RightSidebar
            zoom={zoom}
            setZoom={setZoom}
            pagePadding={pagePadding}
            setPagePadding={setPagePadding}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            renderTemplatePreview={renderTemplatePreview}
            font={font}
          />
        </div>

        {/* Resume scoring section */}
        <div className="mt-8">
          <ResumeScoring />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;