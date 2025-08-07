import React from 'react';
import type { Skill } from '../types';

interface CategorizedSkillsDisplayProps {
  skills: Skill[];
  color?: string;
  variant?: 'compact' | 'detailed' | 'minimal';
  showLevels?: boolean;
  maxSkillsPerCategory?: number;
}

const skillCategories = [
  { id: 'technical', name: 'Technical Skills', icon: '💻' },
  { id: 'soft', name: 'Soft Skills', icon: '🤝' },
  { id: 'languages', name: 'Languages', icon: '🌍' },
  { id: 'tools', name: 'Tools & Platforms', icon: '🛠️' },
  { id: 'frameworks', name: 'Frameworks & Libraries', icon: '📚' },
  { id: 'databases', name: 'Databases', icon: '🗄️' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' }
];

const skillLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];

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
      if (!grouped[skill.category]) {
        grouped[skill.category] = [];
      }
      grouped[skill.category].push(skill);
    });
    return grouped;
  };

  const getCategoryName = (categoryId: string) => {
    return skillCategories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getCategoryIcon = (categoryId: string) => {
    return skillCategories.find(cat => cat.id === categoryId)?.icon || '📋';
  };

  const getLevelColor = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

  const getLevelLabel = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.label || level;
  };

  const groupedSkills = getSkillsByCategory();

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
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="mb-2">
            <span className="text-sm font-medium text-gray-700">
              {getCategoryName(category)}:
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
      <div className="space-y-3">
        {Object.entries(groupedSkills).map(([category, categorySkills]) => (
          <div key={category} className="border-l-2 pl-3" style={{ borderColor: color }}>
            <div className="flex items-center mb-1">
              <span className="mr-2">{getCategoryIcon(category)}</span>
              <h3 className="text-sm font-medium text-gray-900">
                {getCategoryName(category)}
              </h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {categorySkills.slice(0, maxSkillsPerCategory).map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded text-xs"
                  style={{ backgroundColor: `${color}15`, color: color }}
                >
                  {skill.name}
                  {showLevels && skill.level !== 'intermediate' && (
                    <span className={`ml-1 px-1 py-0.5 rounded text-xs ${getLevelColor(skill.level)}`}>
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
