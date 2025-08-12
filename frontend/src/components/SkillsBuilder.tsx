import React, { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import type { Skill } from '../types';
import { skillCategories, skillLevels } from '../utils/settings';
import { suggestedSkills } from '../data/sample';


const SkillsBuilder: React.FC = () => {
  const skills = useResumeStore(state => state.resume.skills);
  const updateSkills = useResumeStore(state => state.updateSkills);
  
  const [newSkill, setNewSkill] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('technical');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const addSkill = (skillName: string) => {
    if (skillName.trim() && !skills.some(s => s.name.toLowerCase() === skillName.trim().toLowerCase())) {
      const newSkillObj: Skill = {
        name: skillName.trim(),
        category: selectedCategory,
        level: selectedLevel
      };
      updateSkills([...skills, newSkillObj]);
      setNewSkill('');
    }
  };

  const removeSkill = (index: number) => {
    updateSkills(skills.filter((_, i) => i !== index));
  };

  const updateSkillLevel = (index: number, level: Skill['level']) => {
    const updatedSkills = [...skills];
    updatedSkills[index].level = level;
    updateSkills(updatedSkills);
  };

  const updateSkillCategory = (index: number, category: string) => {
    const updatedSkills = [...skills];
    updatedSkills[index].category = category;
    updateSkills(updatedSkills);
  };

  const getCategoryIcon = (categoryId: string) => {
    return skillCategories.find(cat => cat.id === categoryId)?.icon || '📋';
  };

  const getLevelColor = (level: Skill['level']) => {
    return skillLevels.find(l => l.value === level)?.color || 'bg-gray-100 text-gray-800';
  };

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

  return (
    <div className="space-y-6">
      {/* Add New Skill Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Skill</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Skill Name Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Skill Name</label>
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && newSkill.trim()) {
                  addSkill(newSkill);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., React, Leadership, Spanish"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {skillCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Level Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as Skill['level'])}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {skillLevels.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => addSkill(newSkill)}
            disabled={!newSkill.trim()}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Skill
          </button>

          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </button>
        </div>

        {/* Skill Suggestions */}
        {showSuggestions && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Suggested Skills for {skillCategories.find(c => c.id === selectedCategory)?.name}</h4>
            <div className="flex flex-wrap gap-2">
              {suggestedSkills[selectedCategory as keyof typeof suggestedSkills]?.map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  disabled={skills.some(s => s.name.toLowerCase() === skill.toLowerCase())}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills List */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Your Skills ({skills.length})</h3>
        
        {skills.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-4xl mb-4">🛠️</div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h4>
            <p className="text-gray-600 mb-4">Add your skills to showcase your expertise and capabilities</p>
            <button
              onClick={() => setShowSuggestions(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Browse Suggestions
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(getSkillsByCategory()).map(([category, categorySkills]) => (
              <div key={category} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                  <span className="mr-2">{getCategoryIcon(category)}</span>
                  {skillCategories.find(c => c.id === category)?.name}
                  <span className="ml-2 text-sm text-gray-500">({categorySkills.length})</span>
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {categorySkills.map((skill, index) => {
                    const skillIndex = skills.findIndex(s => s.name === skill.name && s.category === skill.category);
                    return (
                      <div key={`${skill.name}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{skill.name}</div>
                          <div className="flex items-center space-x-2 mt-1">
                            <select
                              value={skill.level}
                              onChange={(e) => updateSkillLevel(skillIndex, e.target.value as Skill['level'])}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                            >
                              {skillLevels.map(level => (
                                <option key={level.value} value={level.value}>
                                  {level.label}
                                </option>
                              ))}
                            </select>
                            <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(skill.level)}`}>
                              {skillLevels.find(l => l.value === skill.level)?.label}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-3">
                          <select
                            value={skill.category}
                            onChange={(e) => updateSkillCategory(skillIndex, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-1 focus:ring-blue-500"
                          >
                            {skillCategories.map(cat => (
                              <option key={cat.id} value={cat.id}>
                                {cat.icon}
                              </option>
                            ))}
                          </select>
                          
                          <button
                            onClick={() => removeSkill(skillIndex)}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Skills Summary */}
      {skills.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Skills Summary</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {skillLevels.map(level => {
              const levelSkills = skills.filter(s => s.level === level.value);
              if (levelSkills.length === 0) return null;
              
              return (
                <div key={level.value} className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${level.color} mb-2`}>
                    {level.label}
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{levelSkills.length}</div>
                  <div className="text-sm text-gray-600">skills</div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {skillCategories.map(category => {
                const categorySkills = skills.filter(s => s.category === category.id);
                if (categorySkills.length === 0) return null;
                
                return (
                  <div key={category.id} className="text-center">
                    <div className="text-lg mb-1">{category.icon}</div>
                    <div className="text-sm font-medium text-gray-900">{categorySkills.length}</div>
                    <div className="text-xs text-gray-600">{category.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillsBuilder;