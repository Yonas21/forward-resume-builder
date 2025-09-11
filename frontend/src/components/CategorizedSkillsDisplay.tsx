import React from 'react';
import type { Skill } from '../types';
import { skillCategories, skillLevels } from '../utils/settings';

interface CategorizedSkillsDisplayProps {
  skills: Skill[];
  color?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showLevels?: boolean;
  maxSkillsPerCategory?: number;
}

const CategorizedSkillsDisplay: React.FC<CategorizedSkillsDisplayProps> = ({
  skills,
  color = '#2563eb',
  variant = 'detailed',
  showLevels = true,
  maxSkillsPerCategory = 10
}) => {


  const getSkillsByCategory = () => {
    const grouped: { [key: string]: Skill[] } = {};
    skills.forEach(skill => {
      const categoryKey = skill.category_id || skill.category;
      if (!grouped[categoryKey]) {
        grouped[categoryKey] = [];
      }
      grouped[categoryKey].push(skill);
    });
    return grouped;
  };

  const getCategoryName = (categoryId: string) => {
    // Handle edge cases
    if (!categoryId) return 'Other Skills';
    
    const found = skillCategories.find(cat => cat.id === categoryId);
    if (found) {
      return found.name;
    }
    
    // Fallback: try to find by name instead of id
    const foundByName = skillCategories.find(cat => cat.name === categoryId);
    if (foundByName) {
      return foundByName.name;
    }
    
    // Final fallback
    return categoryId || 'Other Skills';
  };

  const getCategoryIcon = (categoryId: string) => {
    if (!categoryId) return '📋';
    
    const found = skillCategories.find(cat => cat.id === categoryId);
    if (found) {
      return found.icon;
    }
    
    // Fallback: try to find by name instead of id
    const foundByName = skillCategories.find(cat => cat.name === categoryId);
    if (foundByName) {
      return foundByName.icon;
    }
    
    return '📋';
  };

  const getCategoryDescription = (categoryId: string) => {
    if (!categoryId) return '';
    
    const found = skillCategories.find(cat => cat.id === categoryId);
    if (found) {
      return found.description;
    }
    
    // Fallback: try to find by name instead of id
    const foundByName = skillCategories.find(cat => cat.name === categoryId);
    if (foundByName) {
      return foundByName.description;
    }
    
    return '';
  };

  const getLevelColor = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.label || level;
  };

  const groupedSkills = getSkillsByCategory();

  // If no skills, show empty state
  if (!skills || skills.length === 0) {
    return (
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 border-b" style={{ color }}>
          Skills
        </h2>
        <p className="text-gray-500 text-sm">No skills added yet.</p>
      </div>
    );
  }

  // Compact variant - all skills in one section
  if (variant === 'compact') {
    return (
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 border-b" style={{ color }}>
          Skills
        </h2>
        <div className="flex flex-wrap gap-1">
                      {skills.slice(0, maxSkillsPerCategory).map((skill, index) => (
              <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                {skill.name}
                {showLevels && skill.level !== 'intermediate' && (
                  <span className="text-xs text-gray-500 ml-1">({skill.level})</span>
                )}
              </span>
            ))}
        </div>
      </div>
    );
  }

  // Minimal variant - just skill names grouped by category
  if (variant === 'minimal') {
    return (
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2 border-b" style={{ color }}>
          Skills
        </h2>
        {Object.entries(groupedSkills).map(([categoryId, categorySkills]) => (
          <div key={categoryId} className="mb-2">
            <span className="text-sm font-medium text-gray-700">
              {getCategoryName(categoryId)}:
            </span>
            <span className="text-sm text-gray-600 ml-1">
              {categorySkills.slice(0, maxSkillsPerCategory).map(s => s.name).join(', ')}
            </span>
          </div>
        ))}
      </div>
    );
  }
  // Detailed variant - full categorized display
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold mb-2 border-b" style={{ color }}>
        Skills
      </h2>
      <div className="space-y-4">
        {Object.entries(groupedSkills).map(([categoryId, categorySkills]) => (
          <div key={categoryId} className="border-l-4 pl-4 py-2" style={{ borderColor: color }}>
            <div className="flex items-center mb-2">
              <span className="mr-2 text-lg">{getCategoryIcon(categoryId)}</span>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">
                  {getCategoryName(categoryId)}
                </h3>
                {getCategoryDescription(categoryId) && (
                  <p className="text-xs text-gray-500 mt-1">
                    {getCategoryDescription(categoryId)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categorySkills.slice(0, maxSkillsPerCategory).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm"
                  style={{ 
                    backgroundColor: `${color}15`, 
                    color: color,
                    border: `1px solid ${color}30`
                  }}
                >
                  {skill.name}
                  {showLevels && skill.level !== 'intermediate' && (
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${getLevelColor(skill.level)}`}>
                      {getLevelLabel(skill.level)}
                    </span>
                  )}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorizedSkillsDisplay;
