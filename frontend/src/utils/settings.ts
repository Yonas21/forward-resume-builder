  export const sections = {
    personal: { name: 'Personal Info', icon: '👤' },
    summary: { name: 'Professional Summary', icon: '📝' },
    experience: { name: 'Work Experience', icon: '💼' },
    education: { name: 'Education', icon: '🎓' },
    skills: { name: 'Skills', icon: '🛠️' },
    projects: { name: 'Projects', icon: '🚀' },
    certifications: { name: 'Certifications', icon: '🏆' }
  };

  export const fontOptions = [
    { value: 'font-sans', name: 'Sans Serif (Modern)', example: 'Aa' },
    { value: 'font-serif', name: 'Serif (Traditional)', example: 'Aa' },
    { value: 'font-mono', name: 'Monospace (Technical)', example: 'Aa' }
  ];

  export const colorPresets = [
    { name: 'Professional Blue', value: '#2563eb' },
    { name: 'Business Gray', value: '#374151' },
    { name: 'Creative Purple', value: '#7c3aed' },
    { name: 'Modern Green', value: '#059669' },
    { name: 'Bold Red', value: '#dc2626' },
    { name: 'Elegant Navy', value: '#1e3a8a' }
  ];

export const professions = [
    'Software Developer',
    'Data Analyst', 
    'Data Engineer',
    'Business & Legal',
    'Creative & Tech',
    'Marketing',
    'Other'
];

export const skillCategories = [
  { id: 'technical', name: 'Technical Skills', icon: '💻' },
  { id: 'soft', name: 'Soft Skills', icon: '🤝' },
  { id: 'languages', name: 'Languages', icon: '🌍' },
  { id: 'tools', name: 'Tools & Platforms', icon: '🛠️' },
  { id: 'frameworks', name: 'Frameworks & Libraries', icon: '📚' },
  { id: 'databases', name: 'Databases', icon: '🗄️' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️' },
  { id: 'design', name: 'Design & Creative', icon: '🎨' }
];

export const skillLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];