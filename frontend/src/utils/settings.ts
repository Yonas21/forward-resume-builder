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
  // Core Technical Skills
  { id: 'programming', name: 'Programming Languages', icon: '💻', description: 'Programming and scripting languages' },
  { id: 'frameworks', name: 'Frameworks & Libraries', icon: '📚', description: 'Development frameworks and libraries' },
  { id: 'databases', name: 'Databases & Storage', icon: '🗄️', description: 'Database systems and data storage' },
  { id: 'cloud', name: 'Cloud & DevOps', icon: '☁️', description: 'Cloud platforms and DevOps tools' },
  
  // Data & Analytics
  { id: 'data_analysis', name: 'Data Analysis', icon: '📊', description: 'Data analysis and visualization tools' },
  { id: 'machine_learning', name: 'Machine Learning', icon: '🤖', description: 'ML and AI technologies' },
  { id: 'statistics', name: 'Statistics & Math', icon: '📈', description: 'Statistical analysis and mathematics' },
  
  // Design & Creative
  { id: 'design', name: 'Design & Creative', icon: '🎨', description: 'Design tools and creative skills' },
  { id: 'ui_ux', name: 'UI/UX Design', icon: '🎯', description: 'User interface and experience design' },
  { id: 'graphics', name: 'Graphics & Media', icon: '🖼️', description: 'Graphic design and media tools' },
  
  // Business & Management
  { id: 'project_management', name: 'Project Management', icon: '📋', description: 'Project management methodologies' },
  { id: 'business_analysis', name: 'Business Analysis', icon: '📊', description: 'Business analysis and strategy' },
  { id: 'marketing', name: 'Marketing & Sales', icon: '📢', description: 'Marketing and sales skills' },
  
  // Tools & Platforms
  { id: 'tools', name: 'Tools & Platforms', icon: '🛠️', description: 'Development and productivity tools' },
  { id: 'operating_systems', name: 'Operating Systems', icon: '💾', description: 'OS and platform knowledge' },
  { id: 'version_control', name: 'Version Control', icon: '📝', description: 'Version control systems' },
  
  // Soft Skills
  { id: 'communication', name: 'Communication', icon: '💬', description: 'Communication and presentation skills' },
  { id: 'leadership', name: 'Leadership', icon: '👥', description: 'Leadership and team management' },
  { id: 'problem_solving', name: 'Problem Solving', icon: '🧩', description: 'Analytical and problem-solving skills' },
  
  // Languages
  { id: 'languages', name: 'Languages', icon: '🌍', description: 'Spoken and written languages' },
  
  // Industry Specific
  { id: 'finance', name: 'Finance & Accounting', icon: '💰', description: 'Financial and accounting skills' },
  { id: 'healthcare', name: 'Healthcare', icon: '🏥', description: 'Healthcare and medical knowledge' },
  { id: 'education', name: 'Education', icon: '📚', description: 'Teaching and educational skills' },
  { id: 'legal', name: 'Legal', icon: '⚖️', description: 'Legal and compliance knowledge' }
];

export const skillLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];