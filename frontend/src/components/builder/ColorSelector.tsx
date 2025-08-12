
import React from 'react';
import { colorPresets } from '../../utils/settings';

interface ColorSelectorProps {
  color: string;
  setColor: (color: string) => void;
}

export const ColorSelector: React.FC<ColorSelectorProps> = ({
  color,
  setColor,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {colorPresets.map((colorOption) => (
          <button
            key={colorOption.value}
            onClick={() => setColor(colorOption.value)}
            className={`p-2 rounded-lg border-2 transition-all ${
              color === colorOption.value
                ? 'border-gray-400 ring-2 ring-gray-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            title={colorOption.name}
          >
            <div
              className="w-full h-8 rounded"
              style={{ backgroundColor: colorOption.value }}
            ></div>
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
        />
        <span className="text-sm text-gray-600">Custom Color</span>
      </div>
    </div>
  );
};
