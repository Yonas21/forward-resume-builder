import React from 'react';
import { FiType, FiGrid, FiAlignLeft, FiAlignCenter, FiAlignRight } from 'react-icons/fi';
import { FaPalette } from "react-icons/fa6";

interface AdvancedFormattingProps {
  font: string;
  setFont: (font: string) => void;
  color: string;
  setColor: (color: string) => void;
  fontSize: string;
  setFontSize: (size: string) => void;
  lineHeight: string;
  setLineHeight: (height: string) => void;
  spacing: string;
  setSpacing: (spacing: string) => void;
  alignment: string;
  setAlignment: (alignment: string) => void;
  showBorders: boolean;
  setShowBorders: (show: boolean) => void;
  showShadows: boolean;
  setShowShadows: (show: boolean) => void;
}

const fontOptions = [
  { value: 'font-sans', label: 'Sans Serif', preview: 'Aa' },
  { value: 'font-serif', label: 'Serif', preview: 'Aa' },
  { value: 'font-mono', label: 'Monospace', preview: 'Aa' },
];

const fontSizeOptions = [
  { value: 'text-xs', label: 'Extra Small' },
  { value: 'text-sm', label: 'Small' },
  { value: 'text-base', label: 'Normal' },
  { value: 'text-lg', label: 'Large' },
  { value: 'text-xl', label: 'Extra Large' },
];

const lineHeightOptions = [
  { value: 'leading-tight', label: 'Tight' },
  { value: 'leading-normal', label: 'Normal' },
  { value: 'leading-relaxed', label: 'Relaxed' },
  { value: 'leading-loose', label: 'Loose' },
];

const spacingOptions = [
  { value: 'compact', label: 'Compact' },
  { value: 'normal', label: 'Normal' },
  { value: 'spacious', label: 'Spacious' },
];

const alignmentOptions = [
  { value: 'left', label: 'Left', icon: FiAlignLeft },
  { value: 'center', label: 'Center', icon: FiAlignCenter },
  { value: 'right', label: 'Right', icon: FiAlignRight },
];

const colorOptions = [
  { value: '#2563eb', label: 'Blue', preview: '#2563eb' },
  { value: '#dc2626', label: 'Red', preview: '#dc2626' },
  { value: '#059669', label: 'Green', preview: '#059669' },
  { value: '#7c3aed', label: 'Purple', preview: '#7c3aed' },
  { value: '#ea580c', label: 'Orange', preview: '#ea580c' },
  { value: '#0891b2', label: 'Cyan', preview: '#0891b2' },
  { value: '#be185d', label: 'Pink', preview: '#be185d' },
  { value: '#1f2937', label: 'Gray', preview: '#1f2937' },
];

export const AdvancedFormatting: React.FC<AdvancedFormattingProps> = ({
  font,
  setFont,
  color,
  setColor,
  fontSize,
  setFontSize,
  lineHeight,
  setLineHeight,
  spacing,
  setSpacing,
  alignment,
  setAlignment,
  showBorders,
  setShowBorders,
  showShadows,
  setShowShadows,
}) => {
  return (
		<div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
			<h3 className="text-lg font-semibold text-gray-900 flex items-center">
				<FiType className="mr-2" />
				Advanced Formatting
			</h3>

			{/* Font Family */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Font Family
				</label>
				<div className="grid grid-cols-3 gap-2">
					{fontOptions.map((option) => (
						<button
							key={option.value}
							onClick={() => setFont(option.value)}
							className={`p-3 rounded-lg border-2 text-center transition-all ${
								font === option.value
									? "border-blue-500 bg-blue-50"
									: "border-gray-200 hover:border-gray-300"
							}`}
						>
							<div className={`${option.value} text-lg mb-1`}>
								{option.preview}
							</div>
							<div className="text-xs text-gray-600">
								{option.label}
							</div>
						</button>
					))}
				</div>
			</div>

			{/* Font Size */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Font Size
				</label>
				<select
					value={fontSize}
					onChange={(e) => setFontSize(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{fontSizeOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Line Height */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Line Height
				</label>
				<select
					value={lineHeight}
					onChange={(e) => setLineHeight(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{lineHeightOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Color Palette */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
					<FaPalette className="mr-1" />
					Accent Color
				</label>
				<div className="grid grid-cols-4 gap-2">
					{colorOptions.map((option) => (
						<button
							key={option.value}
							onClick={() => setColor(option.value)}
							className={`w-full h-10 rounded-lg border-2 transition-all ${
								color === option.value
									? "border-gray-800 scale-105"
									: "border-gray-200 hover:border-gray-300"
							}`}
							style={{ backgroundColor: option.preview }}
							title={option.label}
						/>
					))}
				</div>
				<div className="mt-2">
					<input
						type="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
						className="w-full h-10 rounded-lg border border-gray-300 cursor-pointer"
					/>
				</div>
			</div>

			{/* Spacing */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Section Spacing
				</label>
				<select
					value={spacing}
					onChange={(e) => setSpacing(e.target.value)}
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					{spacingOptions.map((option) => (
						<option key={option.value} value={option.value}>
							{option.label}
						</option>
					))}
				</select>
			</div>

			{/* Text Alignment */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2">
					Text Alignment
				</label>
				<div className="flex gap-2">
					{alignmentOptions.map((option) => {
						const Icon = option.icon;
						return (
							<button
								key={option.value}
								onClick={() => setAlignment(option.value)}
								className={`flex-1 p-3 rounded-lg border-2 transition-all ${
									alignment === option.value
										? "border-blue-500 bg-blue-50"
										: "border-gray-200 hover:border-gray-300"
								}`}
							>
								<Icon className="mx-auto text-lg" />
								<div className="text-xs text-gray-600 mt-1">
									{option.label}
								</div>
							</button>
						);
					})}
				</div>
			</div>

			{/* Visual Effects */}
			<div>
				<label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
					<FiGrid className="mr-1" />
					Visual Effects
				</label>
				<div className="space-y-3">
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={showBorders}
							onChange={(e) => setShowBorders(e.target.checked)}
							className="mr-2"
						/>
						<span className="text-sm text-gray-700">
							Show section borders
						</span>
					</label>
					<label className="flex items-center">
						<input
							type="checkbox"
							checked={showShadows}
							onChange={(e) => setShowShadows(e.target.checked)}
							className="mr-2"
						/>
						<span className="text-sm text-gray-700">
							Add shadows
						</span>
					</label>
				</div>
			</div>
		</div>
  );
};
