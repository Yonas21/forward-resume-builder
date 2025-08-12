
import React from 'react';
import { sections } from '../../utils/settings';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableSection } from '../forms/ResumeForms';
import { TemplateSelector } from './TemplateSelector';
import { FontSelector } from './FontSelector';
import { ColorSelector } from './ColorSelector';

interface LeftSidebarProps {
  selectedTemplate: string;
  setSelectedTemplate: (template: string) => void;
  font: string;
  setFont: (font: string) => void;
  color: string;
  setColor: (color: string) => void;
  sectionOrder: string[];
  handleDragEnd: (event: DragEndEvent) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
  sensors: any;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedTemplate,
  setSelectedTemplate,
  font,
  setFont,
  color,
  setColor,
  sectionOrder,
  handleDragEnd,
  activeSection,
  setActiveSection,
  sensors,
}) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      {/* Template Selector */}
      <TemplateSelector
        selectedTemplate={selectedTemplate}
        setSelectedTemplate={setSelectedTemplate}
      />

      {/* Customization */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize</h3>

        {/* Font Selection */}
        <FontSelector font={font} setFont={setFont} />

        {/* Color Selection */}
        <ColorSelector color={color} setColor={setColor} />
      </div>

      {/* Section Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Sections</h3>
          <span className="text-xs text-gray-500">Drag to reorder</span>
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
            <nav className="space-y-2">
              {sectionOrder.map((sectionKey) => {
                const section = sections[sectionKey as keyof typeof sections];
                return (
                  <SortableSection
                    key={sectionKey}
                    id={sectionKey}
                    section={section}
                    isActive={activeSection === sectionKey}
                    onClick={() => setActiveSection(sectionKey)}
                  />
                );
              })}
            </nav>
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};
