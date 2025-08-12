
import React from 'react';
import { fontOptions } from '../../utils/settings';

interface FontSelectorProps {
  font: string;
  setFont: (font: string) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({
  font,
  setFont,
}) => {
  return (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-3">Font Style</label>
      <div className="space-y-2">
        {fontOptions.map((fontOption) => (
          <label key={fontOption.value} className="flex items-center">
            <input
              type="radio"
              name="font"
              value={fontOption.value}
              checked={font === fontOption.value}
              onChange={(e) => setFont(e.target.value)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="ml-3 text-sm">
              <span className={`${fontOption.value} text-lg font-medium`}>{fontOption.example}</span>
              <span className="text-gray-600 ml-2">{fontOption.name}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};
