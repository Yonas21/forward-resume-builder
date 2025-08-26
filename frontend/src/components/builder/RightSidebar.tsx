
import React, { useState } from 'react';
import { SettingsPanel } from './SettingsPanel';
import { SmartSuggestions, SuggestionChips } from '../SmartSuggestions';
import { SampleContentPanel, QuickSampleSelector } from '../SampleContentPanel';
import { HelpTrigger } from '../ContextualHelpTooltip';

interface RightSidebarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  pagePadding: number;
  setPagePadding: (padding: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  renderTemplatePreview: () => React.ReactNode;
  font: string;
  activeSection?: string;
  onApplySample?: (content: string) => void;
  suggestions?: any[];
  onSelectSuggestion?: (suggestion: any) => void;
  onApplySuggestions?: (suggestions: any[]) => void;
  selectedSuggestions?: string[];
  onShowHelp?: () => void;
}

export const RightSidebar: React.FC<RightSidebarProps> = ({
  zoom,
  setZoom,
  pagePadding,
  setPagePadding,
  showGrid,
  setShowGrid,
  renderTemplatePreview,
  font,
  activeSection,
  onApplySample,
  suggestions = [],
  onSelectSuggestion,
  onApplySuggestions,
  selectedSuggestions = [],
  onShowHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'suggestions' | 'samples'>('preview');
  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
        <SettingsPanel
          zoom={zoom}
          setZoom={setZoom}
          pagePadding={pagePadding}
          setPagePadding={setPagePadding}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
        />

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-4 mt-6">
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'preview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
            <button
              onClick={() => setActiveTab('suggestions')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'suggestions' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Suggestions
            </button>
            <button
              onClick={() => setActiveTab('samples')}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === 'samples' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Samples
            </button>
          </div>
          {onShowHelp && (
            <HelpTrigger onClick={onShowHelp} size="sm" />
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'preview' && (
          <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto">
            <div className="mx-auto">
              <div
                className="bg-white shadow-lg mx-auto origin-top transform"
                style={{ width: '816px', minHeight: '1056px', scale: `${zoom}%` }}
              >
                <div className={`${font}`} style={{ padding: pagePadding }}>
                  {renderTemplatePreview()}
                </div>
                {showGrid && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(59,130,246,0.08), rgba(59,130,246,0.08) 1px, transparent 1px, transparent 8px), repeating-linear-gradient(90deg, rgba(59,130,246,0.08), rgba(59,130,246,0.08) 1px, transparent 1px, transparent 8px)',
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="max-h-[600px] overflow-auto">
            {suggestions.length > 0 ? (
              <SmartSuggestions
                suggestions={suggestions}
                onSelectSuggestion={onSelectSuggestion}
                onApplySuggestions={onApplySuggestions}
                selectedSuggestions={selectedSuggestions}
              />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No suggestions available</p>
                <p className="text-sm">Enter your job title to get personalized suggestions</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'samples' && activeSection && onApplySample && (
          <div className="max-h-[600px] overflow-auto">
            <SampleContentPanel
              section={activeSection}
              onApplySample={onApplySample}
            />
          </div>
        )}
      </div>
    </div>
  );
};