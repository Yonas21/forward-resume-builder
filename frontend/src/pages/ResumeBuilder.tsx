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
import { OnboardingOverlay } from '../components/OnboardingOverlay';
import { AutoSaveStatusBar } from '../components/AutoSaveIndicator';
import { LoadingProgress } from '../components/ProgressIndicator';
import { useContextualHelp } from '../hooks/useContextualHelp';
import { useSmartSuggestions } from '../hooks/useSmartSuggestions';
import { ContextualHelpTooltip } from '../components/ContextualHelpTooltip';
import { SharingPanel } from '../components/collaboration/SharingPanel';
import { FeedbackPanel } from '../components/collaboration/FeedbackPanel';
import { VersionHistory } from '../components/collaboration/VersionHistory';
import { CollaborativeEditing } from '../components/collaboration/CollaborativeEditing';
import { useSharing } from '../hooks/useSharing';
import { useFeedback } from '../hooks/useFeedback';
import { useVersionHistory } from '../hooks/useVersionHistory';
import { useCollaborativeEditing } from '../hooks/useCollaborativeEditing';

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
  
  // Initialize collaboration hooks
  const sharing = useSharing(resume?.id || '');
  const feedback = useFeedback();
  const versionHistory = useVersionHistory(resume?.id || '');
  const collaborativeEditing = useCollaborativeEditing(resume?.id || '');
  
  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: RESUME_BUILDER_SHORTCUTS,
    enabled: true
  });

  // Initialize mobile optimization
  useMobileOptimization({
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

  useCustomEvent('toggle-collaboration', () => {
    setShowCollaboration(!showCollaboration);
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
    'skills',
    'experience',
    'education',
    'projects',
    'certifications'
  ]);
  
  // Collaboration state
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [activeCollaborationTab, setActiveCollaborationTab] = useState<'sharing' | 'feedback' | 'versions' | 'collaboration'>('sharing');

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
          onStartOnboarding={onboarding.startOnboarding}
          collaborationActive={collaborativeEditing.session !== null}
          collaboratorCount={collaborativeEditing.collaborators.length}
        />

      {/* Auto-save indicator and completion indicator */}
      <div className="fixed top-20 right-4 z-30 space-y-2">
        <AutoSaveIndicator />
        <CompactCompletionIndicator />
        
        {/* Collaboration status indicator */}
        {collaborativeEditing.session && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">
                Collaboration Active
              </span>
            </div>
            {collaborativeEditing.collaborators.length > 0 && (
              <div className="mt-2 text-xs text-green-600">
                {collaborativeEditing.collaborators.length} collaborator{collaborativeEditing.collaborators.length !== 1 ? 's' : ''} online
              </div>
            )}
          </div>
        )}
      </div>

      {/* Collaboration toggle button */}
      <div className="fixed top-20 left-4 z-30">
        <button
          onClick={() => setShowCollaboration(!showCollaboration)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {showCollaboration ? 'Hide Collaboration' : 'Show Collaboration'}
        </button>
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
      {contextualHelp.activeTip && (
        <ContextualHelpTooltip
          tip={contextualHelp.activeTip}
          isVisible={contextualHelp.isVisible}
          position={contextualHelp.position}
          onClose={contextualHelp.hideTip}
        />
      )}

      {/* Collaboration Panel */}
      {showCollaboration && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Collaboration Tools</h2>
              <button
                onClick={() => setShowCollaboration(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b">
              <button
                onClick={() => setActiveCollaborationTab('sharing')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeCollaborationTab === 'sharing'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sharing
              </button>
              <button
                onClick={() => setActiveCollaborationTab('feedback')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeCollaborationTab === 'feedback'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Feedback
              </button>
              <button
                onClick={() => setActiveCollaborationTab('versions')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeCollaborationTab === 'versions'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Version History
              </button>
              <button
                onClick={() => setActiveCollaborationTab('collaboration')}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeCollaborationTab === 'collaboration'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Real-time Editing
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeCollaborationTab === 'sharing' && (
                <div className="h-full overflow-y-auto">
                  <SharingPanel
                    shareLinks={sharing.shareLinks}
                    shareStats={sharing.shareStats}
                    onCreateShareLink={sharing.createShareLink}
                    onRevokeShareLink={sharing.revokeShareLink}
                    
                    onCopyShareUrl={sharing.copyShareUrl}
                    
                    className="p-6"
                  />
                </div>
              )}

              {activeCollaborationTab === 'feedback' && (
                <div className="h-full overflow-y-auto">
                  <FeedbackPanel
                    feedback={feedback.feedback}
                    feedbackStats={feedback.feedbackStats}
                    onAddFeedback={feedback.addFeedback}
                    onUpdateFeedbackStatus={feedback.updateFeedbackStatus}
                    onAddReply={feedback.addReply}
                    onShowFeedbackForm={() => setActiveCollaborationTab('feedback')}
                    isLoading={feedback.isLoading}
                    className="p-6"
                  />
                </div>
              )}

              {activeCollaborationTab === 'versions' && (
                <div className="h-full overflow-y-auto">
                  <VersionHistory
                    versions={versionHistory.versions}
                    
                    onRestoreVersion={versionHistory.restoreVersion}
                    onCompareVersions={versionHistory.compareVersions}
                    onPublishVersion={versionHistory.publishVersion}
                    
                    
                    className="p-6"
                  />
                </div>
              )}

              {activeCollaborationTab === 'collaboration' && (
                <div className="h-full overflow-y-auto">
                  <CollaborativeEditing
                    session={collaborativeEditing.session}
                    collaborators={collaborativeEditing.collaborators}
                    currentUser={collaborativeEditing.currentUser}
                    onInitializeSession={collaborativeEditing.initializeSession}
                    onJoinSession={collaborativeEditing.joinSession}
                    onLeaveSession={collaborativeEditing.leaveSession}
                    onUpdateCursorPosition={collaborativeEditing.updateCursorPosition}
                    onUpdateCurrentSection={collaborativeEditing.updateCurrentSection}
                    isLoading={collaborativeEditing.isLoading}
                    className="p-6"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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