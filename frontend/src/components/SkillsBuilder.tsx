
import React from 'react';
import { useResumeStore } from '../store/resumeStore';

const SkillsBuilder: React.FC = () => {
  const { resume, addSkill, updateSkill, deleteSkill } = useResumeStore();

  if (!resume) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Skills</h3>
        <button
          onClick={() => addSkill({ name: '', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' })}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Skill
        </button>
      </div>

      {resume.skills.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="text-4xl mb-4">💡</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No skills added yet</h4>
          <p className="text-gray-600 mb-4">Add your skills to highlight your expertise</p>
          <button
            onClick={() => addSkill({ name: '', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' })}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Your First Skill
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {resume.skills.map((skill, index) => (
            <div key={index} className="flex items-center space-x-3">
              <input
                type="text"
                value={skill.name}
                onChange={(e) => updateSkill(index, { name: e.target.value })}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Skill name (e.g., JavaScript)"
              />
              <select
                value={skill.level}
                onChange={(e) => updateSkill(index, { level: e.target.value as 'beginner' | 'intermediate' | 'advanced' | 'expert' })}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
              <button
                onClick={() => deleteSkill(index)}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SkillsBuilder;
