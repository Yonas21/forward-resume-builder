
import React from 'react';

interface SettingsPanelProps {
  zoom: number;
  setZoom: (zoom: number) => void;
  pagePadding: number;
  setPagePadding: (padding: number) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  zoom,
  setZoom,
  pagePadding,
  setPagePadding,
  showGrid,
  setShowGrid,
}) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
      <div className="flex items-center space-x-2" aria-label="Live preview zoom controls">
        <label htmlFor="builder-zoom" className="sr-only">
          Zoom
        </label>
        <select
          id="builder-zoom"
          className="px-2 py-1 border border-gray-300 rounded text-sm"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value, 10))}
        >
          <option value={90}>90%</option>
          <option value={95}>95%</option>
          <option value={100}>100%</option>
          <option value={125}>125%</option>
          <option value={150}>150%</option>
        </select>
      </div>
      <div className="flex items-center space-x-3">
        <label htmlFor="builder-padding" className="text-xs text-gray-600">
          Padding
        </label>
        <input
          id="builder-padding"
          type="range"
          min={16}
          max={64}
          step={4}
          value={pagePadding}
          onChange={(e) => setPagePadding(parseInt(e.target.value, 10))}
          aria-label="Page padding"
        />
        <span className="text-xs text-gray-600 w-8 text-right">{pagePadding}px</span>
      </div>
      <label className="inline-flex items-center space-x-2 ml-2">
        <input
          type="checkbox"
          checked={showGrid}
          onChange={(e) => setShowGrid(e.target.checked)}
          aria-label="Toggle grid overlay"
        />
        <span className="text-xs text-gray-600">Grid</span>
      </label>
    </div>
  );
};
