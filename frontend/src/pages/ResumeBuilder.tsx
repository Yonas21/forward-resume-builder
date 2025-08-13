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

const ResumeBuilder: React.FC = () => {
  const {
    resume,
    fetchMyResume,
  } = useResumeStore();

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

        return arrayMove(items, oldIndex, newIndex);
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
      sectionOrder
    });
  };

  // Ensure focus outlines are visible for keyboard users
  useEffect(() => {
    document.body.classList.add('focus:outline-none');
  }, []);

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
    <div className="min-h-screen bg-gray-50">
      <Header selectedTemplate={selectedTemplate} font={font} color={color} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
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
          />

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
      </div>
    </div>
  );
};

export default ResumeBuilder;