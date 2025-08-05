import React from 'react';
import { templates } from './TemplateConfig';

interface TemplateSelectorProps {
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
  profession?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  selectedTemplate,
  onSelectTemplate,
  profession,
}) => {
  // Filter templates by profession if provided
  const filteredTemplates = profession
    ? templates.filter(
        (template) =>
          template.profession.toLowerCase() === profession.toLowerCase() ||
          template.profession === 'General'
      )
    : templates;

  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold mb-3">Choose a Template</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg p-3 cursor-pointer transition-all ${selectedTemplate === template.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' : 'border-gray-200 hover:border-blue-300'}`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="aspect-w-4 aspect-h-3 mb-2 bg-gray-100 rounded overflow-hidden">
              {/* Placeholder for template thumbnail */}
              <div className="flex items-center justify-center h-24 text-gray-400">
                {template.name}
              </div>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-sm">{template.name}</h3>
              <p className="text-xs text-gray-500">{template.profession}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;