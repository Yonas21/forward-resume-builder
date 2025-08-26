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
import { useErrorHandler } from '../hooks/useErrorHandler';
import { AutoSaveIndicator } from '../components/AutoSaveIndicator';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { ResumeScoring } from '../components/ResumeScoring';
import { AdvancedFormatting } from '../components/builder/AdvancedFormatting';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { useKeyboardShortcuts, RESUME_BUILDER_SHORTCUTS, useCustomEvent } from '../hooks/useKeyboardShortcuts';
import { useMobileOptimization } from '../hooks/useMobileOptimization';
import { CompactCompletionIndicator } from '../components/ResumeCompletionIndicator';
import { KeyboardShortcutsHelp, useKeyboardShortcutsHelp } from '../components/KeyboardShortcutsHelp';
import { useOnboarding } from '../hooks/useOnboarding';
import { useResumeHistory } from '../hooks/useUndoRedo';
import { OnboardingOverlay, OnboardingTrigger } from '../components/OnboardingOverlay';
import { AutoSaveStatusBar } from '../components/AutoSaveIndicator';
import { LoadingProgress } from '../components/ProgressIndicator';
import { useContextualHelp } from '../hooks/useContextualHelp';
import { useSmartSuggestions } from '../hooks/useSmartSuggestions';
import { ContextualHelpTooltip, HelpTrigger } from '../components/ContextualHelpTooltip';
import { SmartSuggestions, SuggestionChips } from '../components/SmartSuggestions';
import { SampleContentPanel, QuickSampleSelector } from '../components/SampleContentPanel';

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
  const keyboardHelp = useKeyboardShortcutsHelp();
  const undoRedo = useResumeHistory(resume);
  const contextualHelp = useContextualHelp({
    enabled: true,
    autoShow: true,
    delayMs: 3000,
    maxTipsPerSession: 5
  });
  const smartSuggestions = useSmartSuggestions({
    enabled: true,
    autoSuggest: true,
    maxSuggestions: 10,
    minRelevance: 30
  });
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: RESUME_BUILDER_SHORTCUTS,
    enabled: true
  });

  // Initialize mobile optimization
  const mobileOpts = useMobileOptimization({
    enableTouchGestures: true,
    enableSwipeNavigation: true,
    enableTouchFeedback: true
  });

  // Handle custom events from keyboard shortcuts
  useCustomEvent('resume-save', () => {
    // Trigger save action
    console.log('Save triggered via keyboard shortcut');
  });

  useCustomEvent('resume-undo', () => {
    const previousResume = undoRedo.undo();
    if (previousResume) {
      // Update the resume store with the previous state
      console.log('Undo triggered via keyboard shortcut');
    }
  });

  useCustomEvent('resume-redo', () => {
    const nextResume = undoRedo.redo();
    if (nextResume) {
      // Update the resume store with the next state
      console.log('Redo triggered via keyboard shortcut');
    }
  });

  useCustomEvent('resume-navigate', (event) => {
    const section = event.detail;
    setActiveSection(section);
  });

  useCustomEvent('show-keyboard-help', () => {
    keyboardHelp.openHelp();
  });

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
      <LoadingOverlay 
        isVisible={true} 
        text="Loading your resume..." 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 resume-builder-container">
              <Header 
          selectedTemplate={selectedTemplate} 
          font={font} 
          color={color} 
          onStartOnboarding={onboarding.start}
        />

      {/* Auto-save indicator and completion indicator */}
      <div className="fixed top-20 right-4 z-30 space-y-2">
        <AutoSaveIndicator />
        <CompactCompletionIndicator />
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
        isActive={onboarding.isActive}
        currentStep={onboarding.currentStep}
        onNext={onboarding.next}
        onPrevious={onboarding.previous}
        onSkip={onboarding.skip}
        currentStepIndex={onboarding.currentStepIndex}
        totalSteps={onboarding.totalSteps}
        showProgress={true}
        allowSkip={true}
      />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsHelp
        isOpen={keyboardHelp.isHelpOpen}
        onClose={keyboardHelp.closeHelp}
      />

      {/* Auto-save status bar */}
      <AutoSaveStatusBar />

      {/* Loading progress for long operations */}
      <LoadingProgress
        isLoading={false} // Set to true when performing long operations
        progress={0}
        status="Processing..."
        title="Please wait"
      />

      {/* Contextual help tooltip */}
      <ContextualHelpTooltip
        tip={contextualHelp.activeTip}
        isVisible={contextualHelp.isVisible}
        position={contextualHelp.position}
        onClose={contextualHelp.hideTip}
        showProgress={true}
        allowSkip={true}
      />

      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          <div className="lg:col-span-1 space-y-4 md:space-y-6 order-2 lg:order-1">
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
              onStartOnboarding={onboarding.start}
              hasCompletedOnboarding={onboarding.hasCompleted}
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
            activeSection={activeSection}
            onApplySample={(content) => {
              // Apply sample content to the current section
              console.log('Applying sample content:', content);
            }}
            suggestions={smartSuggestions.currentSuggestions}
            onSelectSuggestion={smartSuggestions.selectSuggestion}
            onApplySuggestions={(suggestions) => {
              // Apply selected suggestions
              console.log('Applying suggestions:', suggestions);
            }}
            selectedSuggestions={smartSuggestions.selectedSuggestions}
            onShowHelp={() => {
              // Show contextual help for current section
              contextualHelp.autoShowTip({
                section: activeSection,
                field: activeSection
              });
            }}
          />
        </div>

        {/* Resume scoring section */}
        <div className="mt-4 md:mt-8">
          <ResumeScoring />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;