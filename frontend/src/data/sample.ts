import type { Resume } from "../types";

export const sampleResume: Resume = {
    personal_info: {
      full_name: 'Your Name',
      email: 'yourname@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/yourname',
      github: 'github.com/yourname',
      website: 'yourportfolio.dev'
    },
    professional_summary: 'Detail-oriented Data Analyst with 4+ years of experience transforming complex datasets into actionable insights. Proficient in statistical analysis, data visualization, and communicating findings to technical and non-technical stakeholders.',
    skills: [
      { name: 'SQL', category_id: 'databases', category: 'Databases', level: 'advanced' },
      { name: 'Python', category_id: 'technical', category: 'Technical Skills', level: 'expert' },
      { name: 'R', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'Tableau', category_id: 'tools', category: 'Tools & Platforms', level: 'advanced' },
      { name: 'Power BI', category_id: 'tools', category: 'Tools & Platforms', level: 'intermediate' },
      { name: 'Excel', category_id: 'tools', category: 'Tools & Platforms', level: 'expert' },
      { name: 'Statistical Analysis', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'Data Visualization', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'Machine Learning', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' },
      { name: 'A/B Testing', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' },
      { name: 'Data Cleaning', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'ETL Processes', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' }
    ],
    experience: [
      {
        company: 'Data Insights Corp',
        position: 'Senior Data Analyst',
        start_date: 'Jun 2021',
        end_date: 'Present',
        is_current: true,
        description: ['Analyzed customer behavior data to identify patterns, resulting in 15% increase in user retention', 'Built interactive dashboards using Tableau to visualize KPIs for executive leadership', 'Implemented A/B testing framework that improved conversion rates by 22%', 'Collaborated with cross-functional teams to develop data-driven solutions']
      },
      {
        company: 'Tech Analytics LLC',
        position: 'Data Analyst',
        start_date: 'Mar 2019',
        end_date: 'May 2021',
        is_current: false,
        description: ['Performed data cleaning and preprocessing on large datasets using Python and SQL', 'Created automated reporting systems that saved 10 hours of manual work weekly', 'Conducted statistical analysis to identify market trends and opportunities', 'Presented findings to stakeholders in clear, actionable reports']
      }
    ],
    education: [
      {
        institution: 'University of Data Science',
        degree: 'Master of Science',
        field_of_study: 'Data Analytics',
        start_date: '2017',
        end_date: '2019',
        gpa: '3.9'
      },
      {
        institution: 'State University',
        degree: 'Bachelor of Science',
        field_of_study: 'Statistics',
        start_date: '2013',
        end_date: '2017',
        gpa: '3.7'
      }
    ],
    projects: [
      {
        name: 'Customer Segmentation Analysis',
        description: 'Applied clustering algorithms to segment customers based on purchasing behavior, enabling targeted marketing campaigns that increased revenue by 18%.',
        technologies: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib', 'K-means Clustering']
      },
      {
        name: 'Sales Prediction Model',
        description: 'Developed a machine learning model to forecast quarterly sales with 92% accuracy, helping the company optimize inventory management and resource allocation.',
        technologies: ['R', 'Random Forest', 'Time Series Analysis', 'Data Visualization', 'Feature Engineering']
      }
    ],
    certifications: [
      {
        name: 'Microsoft Certified: Data Analyst Associate',
        issuing_organization: 'Microsoft',
        issue_date: '2022-03-15',
        expiration_date: '2025-03-15',
        credential_id: 'DA-123456'
      },
      {
        name: 'Google Data Analytics Professional Certificate',
        issuing_organization: 'Google',
        issue_date: '2021-06-10',
        expiration_date: '',
        credential_id: 'GDA-789012'
      }
    ]
  };

export const sampleTemplateResume: Resume = {
        personal_info: {
          full_name: 'John Doe',
          email: 'john@example.com',
          phone: '+1 (555) 123-4567',
          location: 'New York, NY',
          linkedin: 'linkedin.com/in/johndoe',
          github: 'github.com/johndoe',
          website: 'johndoe.com'
        },
        professional_summary: 'Experienced professional with expertise in modern technologies and proven track record of success.',
        skills: [
          { name: 'JavaScript', category_id: 'languages', category: 'Languages', level: 'advanced' },
          { name: 'React', category_id: 'frameworks', category: 'Frameworks & Libraries', level: 'advanced' },
          { name: 'Node.js', category_id: 'frameworks', category: 'Frameworks & Libraries', level: 'intermediate' },
          { name: 'Python', category_id: 'languages', category: 'Languages', level: 'intermediate' },
        ],
        experience: [{
          company: 'Tech Corp',
          position: 'Senior Developer',
          start_date: '2020-01-01',
          end_date: '2023-12-31',
          description: ['Led development of key features', 'Mentored junior developers'],
          is_current: false
        }],
        education: [{
          institution: 'University of Technology',
          degree: 'Bachelor of Science',
          field_of_study: 'Computer Science',
          start_date: '2016-09-01',
          end_date: '2020-05-31',
          gpa: '3.8'
        }],
        projects: [],
        certifications: []
      };

export const samplePreviewResume: Resume = {
    personal_info: {
      full_name: 'Your Name',
      email: 'yourname@example.com',
      phone: '(555) 123-4567',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/yourname',
      github: 'github.com/yourname',
      website: 'yourportfolio.dev'
    },
    professional_summary: 'Detail-oriented Data Analyst with 4+ years of experience transforming complex datasets into actionable insights. Proficient in statistical analysis, data visualization, and communicating findings to technical and non-technical stakeholders.',
    skills: [
      { name: 'SQL', category_id: 'languages', category: 'Languages', level: 'expert' },
      { name: 'Python', category_id: 'languages', category: 'Languages', level: 'expert' },
      { name: 'R', category_id: 'languages', category: 'Languages', level: 'advanced' },
      { name: 'Tableau', category_id: 'tools', category: 'Tools & Platforms', level: 'expert' },
      { name: 'Power BI', category_id: 'tools', category: 'Tools & Platforms', level: 'advanced' },
      { name: 'Excel', category_id: 'tools', category: 'Tools & Platforms', level: 'expert' },
      { name: 'Statistical Analysis', category_id: 'technical', category: 'Technical Skills', level: 'expert' },
      { name: 'Data Visualization', category_id: 'technical', category: 'Technical Skills', level: 'expert' },
      { name: 'Machine Learning', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'A/B Testing', category_id: 'technical', category: 'Technical Skills', level: 'advanced' },
      { name: 'Data Cleaning', category_id: 'technical', category: 'Technical Skills', level: 'expert' },
      { name: 'ETL Processes', category_id: 'technical', category: 'Technical Skills', level: 'intermediate' },
    ],
    experience: [
      {
        company: 'Data Insights Corp',
        position: 'Senior Data Analyst',
        start_date: 'Jun 2021',
        end_date: 'Present',
        is_current: true,
        description: ['Analyzed customer behavior data to identify patterns, resulting in 15% increase in user retention', 'Built interactive dashboards using Tableau to visualize KPIs for executive leadership', 'Implemented A/B testing framework that improved conversion rates by 22%', 'Collaborated with cross-functional teams to develop data-driven solutions']
      },
      {
        company: 'Tech Analytics LLC',
        position: 'Data Analyst',
        start_date: 'Mar 2019',
        end_date: 'May 2021',
        is_current: false,
        description: ['Performed data cleaning and preprocessing on large datasets using Python and SQL', 'Created automated reporting systems that saved 10 hours of manual work weekly', 'Conducted statistical analysis to identify market trends and opportunities', 'Presented findings to stakeholders in clear, actionable reports']
      }
    ],
    education: [
      {
        institution: 'University of Data Science',
        degree: 'Master of Science',
        field_of_study: 'Data Analytics',
        start_date: '2017',
        end_date: '2019',
        gpa: '3.9'
      },
      {
        institution: 'State University',
        degree: 'Bachelor of Science',
        field_of_study: 'Statistics',
        start_date: '2013',
        end_date: '2017',
        gpa: '3.7'
      }
    ],
    projects: [
      {
        name: 'Customer Segmentation Analysis',
        description: 'Applied clustering algorithms to segment customers based on purchasing behavior, enabling targeted marketing campaigns that increased revenue by 18%.',
        technologies: ['Python', 'scikit-learn', 'Pandas', 'Matplotlib', 'K-means Clustering']
      },
      {
        name: 'Sales Prediction Model',
        description: 'Developed a machine learning model to forecast quarterly sales with 92% accuracy, helping the company optimize inventory management and resource allocation.',
        technologies: ['R', 'Random Forest', 'Time Series Analysis', 'Data Visualization', 'Feature Engineering']
      }
    ],
    certifications: [
      {
        name: 'Microsoft Certified: Data Analyst Associate',
        issuing_organization: 'Microsoft',
        issue_date: '2022-03-15',
        expiration_date: '2025-03-15',
        credential_id: 'DA-123456'
      },
      {
        name: 'Google Data Analytics Professional Certificate',
        issuing_organization: 'Google',
        issue_date: '2021-06-10',
        expiration_date: '',
        credential_id: 'GDA-789012'
      }
    ]
  };

export const previewTemplates = [
    {
        id: 1,
        name: 'Professional Template',
        description: 'A clean and formal resume template for professional roles.',
        previewImage: 'path/to/professional-template.jpg',
    },
    {
        id: 2,
        name: 'Creative Template',
        description: 'A vibrant template for creative positions.',
        previewImage: 'path/to/creative-template.jpg',
    },
    {
        id: 3,
        name: 'Minimalist Template',
        description: 'A simple and elegant template for all professions.',
        previewImage: 'path/to/minimalist-template.jpg',
    },
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

export const suggestedSkills = {
  technical: [
    'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'Go', 'Rust', 'PHP', 'Ruby',
    'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Assembly', 'Shell Scripting', 'SQL'
  ],
  soft: [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Time Management',
    'Critical Thinking', 'Adaptability', 'Creativity', 'Emotional Intelligence', 'Negotiation',
    'Public Speaking', 'Project Management', 'Mentoring', 'Conflict Resolution'
  ],
  languages: [
    'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Arabic',
    'Portuguese', 'Italian', 'Russian', 'Hindi', 'Dutch', 'Swedish', 'Norwegian'
  ],
  tools: [
    'Git', 'Docker', 'Kubernetes', 'Jenkins', 'Jira', 'Confluence', 'Slack', 'Trello',
    'Figma', 'Adobe Creative Suite', 'VS Code', 'IntelliJ IDEA', 'Postman', 'Tableau'
  ],
  frameworks: [
    'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring',
    'Laravel', 'Ruby on Rails', '.NET', 'Bootstrap', 'Tailwind CSS', 'jQuery'
  ],
  databases: [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQL Server', 'SQLite',
    'Cassandra', 'DynamoDB', 'Firebase', 'Elasticsearch', 'Neo4j'
  ],
  cloud: [
    'AWS', 'Azure', 'Google Cloud', 'Heroku', 'DigitalOcean', 'Vercel', 'Netlify',
    'Terraform', 'Ansible', 'Chef', 'Puppet', 'Prometheus', 'Grafana'
  ],
  design: [
    'UI/UX Design', 'Graphic Design', 'Web Design', 'Mobile Design', 'Brand Design',
    'Illustration', 'Typography', 'Color Theory', 'Prototyping', 'User Research'
  ]
};

export const skillLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
  { value: 'expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
];
