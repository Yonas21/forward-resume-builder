
import React from 'react';
import { SettingsPanel } from './SettingsPanel';

interface RightSidebarProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  pagePadding: number;
  setPagePadding: (padding: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  renderTemplatePreview: () => React.ReactNode;
  font: string;
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
}) => {
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
        <div className="bg-gray-50 rounded-lg p-4 max-h-[600px] overflow-auto">
          <div className="mx-auto">
            <div
              className="bg-white shadow-lg mx-auto origin-top transform"
              style={{ width: '816px', minHeight: '1056px', scale: `${zoom}%` as any }}
            >
              <div className={`${font}`} style={{ padding: pagePadding }}>
                {renderTemplatePreview()}
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
      </div>
    </div>
    </div>
  )};