import { useState, useCallback, useMemo } from 'react';

export interface JobSuggestion {
  id: string;
  title: string;
  description: string;
  category: 'skill' | 'achievement' | 'keyword' | 'template' | 'section';
  relevance: number; // 0-100
  source: 'industry' | 'job-title' | 'common' | 'ai';
}

export interface IndustryData {
  name: string;
  keywords: string[];
  commonSkills: string[];
  achievements: string[];
  templates: string[];
  sections: string[];
}

export interface SmartSuggestionsConfig {
  enabled?: boolean;
  autoSuggest?: boolean;
  maxSuggestions?: number;
  minRelevance?: number;
}

export const useSmartSuggestions = (config: SmartSuggestionsConfig = {}) => {
  const {
    enabled = true,
    autoSuggest = true,
    maxSuggestions = 10,
    minRelevance = 30
  } = config;

  const [jobTitle, setJobTitle] = useState('');
  const [industry, setIndustry] = useState('');
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(new Set());

  // Industry data for smart suggestions
  const industryData: Record<string, IndustryData> = {
    'technology': {
      name: 'Technology',
      keywords: ['software', 'development', 'programming', 'coding', 'technical', 'engineering', 'system', 'application', 'platform', 'database', 'cloud', 'api', 'framework', 'algorithm', 'architecture'],
      commonSkills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git', 'AWS', 'Docker', 'Kubernetes', 'Agile', 'Scrum', 'REST APIs', 'Microservices', 'DevOps'],
      achievements: [
        'Developed and deployed 3 full-stack web applications serving 10,000+ users',
        'Reduced application load time by 40% through optimization and caching',
        'Led a team of 5 developers to deliver a mobile app with 4.8-star rating',
        'Implemented CI/CD pipeline reducing deployment time by 60%',
        'Architected scalable microservices handling 1M+ daily requests'
      ],
      templates: ['modern', 'clean', 'professional'],
      sections: ['Technical Skills', 'Projects', 'Certifications', 'Open Source']
    },
    'marketing': {
      name: 'Marketing',
      keywords: ['campaign', 'strategy', 'brand', 'social media', 'content', 'digital', 'analytics', 'seo', 'ppc', 'email', 'growth', 'conversion', 'engagement', 'reach', 'roi'],
      commonSkills: ['Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO', 'Content Marketing', 'Email Marketing', 'Social Media Management', 'HubSpot', 'Mailchimp', 'Adobe Creative Suite', 'Data Analysis', 'A/B Testing'],
      achievements: [
        'Increased website traffic by 150% through SEO optimization',
        'Managed $500K+ monthly ad spend with 3.2x ROI',
        'Grew social media following by 200% in 6 months',
        'Launched successful email campaign with 25% open rate',
        'Developed brand strategy resulting in 40% increase in brand awareness'
      ],
      templates: ['creative', 'modern', 'colorful'],
      sections: ['Campaigns', 'Analytics', 'Tools & Platforms', 'Results']
    },
    'finance': {
      name: 'Finance',
      keywords: ['financial', 'analysis', 'budget', 'forecasting', 'investment', 'risk', 'compliance', 'audit', 'accounting', 'trading', 'portfolio', 'valuation', 'modeling', 'reporting'],
      commonSkills: ['Financial Modeling', 'Excel', 'QuickBooks', 'SAP', 'Bloomberg Terminal', 'Risk Management', 'Financial Analysis', 'Budgeting', 'Forecasting', 'Compliance', 'Audit', 'Valuation'],
      achievements: [
        'Managed $10M investment portfolio achieving 12% annual returns',
        'Reduced operational costs by 25% through process optimization',
        'Developed financial models for $50M acquisition deal',
        'Led audit team ensuring 100% compliance with regulations',
        'Created budget forecasting system improving accuracy by 30%'
      ],
      templates: ['professional', 'conservative', 'clean'],
      sections: ['Financial Analysis', 'Risk Management', 'Compliance', 'Tools']
    },
    'healthcare': {
      name: 'Healthcare',
      keywords: ['patient', 'clinical', 'medical', 'healthcare', 'treatment', 'diagnosis', 'care', 'nursing', 'pharmacy', 'therapy', 'rehabilitation', 'prevention', 'wellness'],
      commonSkills: ['Patient Care', 'Clinical Documentation', 'Medical Terminology', 'HIPAA Compliance', 'Electronic Health Records', 'CPR Certification', 'Medical Software', 'Patient Assessment', 'Treatment Planning'],
      achievements: [
        'Provided care for 50+ patients daily maintaining 100% safety record',
        'Reduced patient wait times by 30% through process improvement',
        'Led clinical team of 15 staff members',
        'Implemented new treatment protocols improving patient outcomes by 25%',
        'Maintained 100% compliance with healthcare regulations'
      ],
      templates: ['professional', 'clean', 'trustworthy'],
      sections: ['Clinical Experience', 'Certifications', 'Specializations', 'Patient Care']
    },
    'sales': {
      name: 'Sales',
      keywords: ['sales', 'revenue', 'quota', 'prospecting', 'closing', 'negotiation', 'relationship', 'account', 'territory', 'commission', 'target', 'pipeline', 'lead', 'customer'],
      commonSkills: ['CRM Software', 'Salesforce', 'Lead Generation', 'Negotiation', 'Relationship Building', 'Pipeline Management', 'Account Management', 'Presentation Skills', 'Cold Calling', 'Sales Strategy'],
      achievements: [
        'Exceeded sales quota by 150% for 3 consecutive years',
        'Generated $2M in new business revenue',
        'Managed 50+ enterprise accounts worth $5M annually',
        'Closed 25+ deals averaging $100K each',
        'Built and maintained 200+ customer relationships'
      ],
      templates: ['dynamic', 'professional', 'modern'],
      sections: ['Sales Performance', 'Key Accounts', 'Achievements', 'Tools']
    },
    'education': {
      name: 'Education',
      keywords: ['teaching', 'curriculum', 'student', 'learning', 'assessment', 'instruction', 'classroom', 'education', 'academic', 'lesson', 'grade', 'mentor', 'tutor'],
      commonSkills: ['Curriculum Development', 'Student Assessment', 'Classroom Management', 'Lesson Planning', 'Educational Technology', 'Differentiated Instruction', 'Parent Communication', 'Student Engagement'],
      achievements: [
        'Improved student test scores by 35% through innovative teaching methods',
        'Developed and implemented new curriculum for 200+ students',
        'Led professional development workshops for 25+ teachers',
        'Maintained 95% student satisfaction rate',
        'Reduced classroom behavioral issues by 40%'
      ],
      templates: ['friendly', 'professional', 'clean'],
      sections: ['Teaching Experience', 'Curriculum Development', 'Student Outcomes', 'Professional Development']
    }
  };

  // Job title to industry mapping
  const jobTitleMapping: Record<string, string> = {
    // Technology
    'software engineer': 'technology',
    'developer': 'technology',
    'programmer': 'technology',
    'full stack developer': 'technology',
    'frontend developer': 'technology',
    'backend developer': 'technology',
    'data scientist': 'technology',
    'devops engineer': 'technology',
    'product manager': 'technology',
    'technical lead': 'technology',
    
    // Marketing
    'marketing manager': 'marketing',
    'digital marketing specialist': 'marketing',
    'social media manager': 'marketing',
    'content marketer': 'marketing',
    'seo specialist': 'marketing',
    'ppc specialist': 'marketing',
    'brand manager': 'marketing',
    'marketing coordinator': 'marketing',
    
    // Finance
    'financial analyst': 'finance',
    'accountant': 'finance',
    'investment banker': 'finance',
    'financial advisor': 'finance',
    'auditor': 'finance',
    'controller': 'finance',
    'treasurer': 'finance',
    'risk manager': 'finance',
    
    // Healthcare
    'nurse': 'healthcare',
    'doctor': 'healthcare',
    'physician': 'healthcare',
    'pharmacist': 'healthcare',
    'therapist': 'healthcare',
    'medical assistant': 'healthcare',
    'healthcare administrator': 'healthcare',
    
    // Sales
    'sales representative': 'sales',
    'account executive': 'sales',
    'sales manager': 'sales',
    'business development': 'sales',
    'sales director': 'sales',
    'inside sales': 'sales',
    'outside sales': 'sales',
    
    // Education
    'teacher': 'education',
    'professor': 'education',
    'instructor': 'education',
    'educator': 'education',
    'principal': 'education',
    'administrator': 'education',
    'tutor': 'education'
  };

  // Get suggestions based on job title and industry
  const getSuggestions = useCallback((title: string, ind?: string): JobSuggestion[] => {
    if (!enabled) return [];

    const suggestions: JobSuggestion[] = [];
    const detectedIndustry = ind || detectIndustryFromTitle(title);
    
    if (detectedIndustry && industryData[detectedIndustry]) {
      const data = industryData[detectedIndustry];
      
      // Add skills suggestions
      data.commonSkills.forEach((skill, index) => {
        suggestions.push({
          id: `skill-${skill}`,
          title: skill,
          description: `Common skill in ${data.name} industry`,
          category: 'skill',
          relevance: 90 - (index * 5),
          source: 'industry'
        });
      });

      // Add achievement suggestions
      data.achievements.forEach((achievement, index) => {
        suggestions.push({
          id: `achievement-${index}`,
          title: 'Achievement Example',
          description: achievement,
          category: 'achievement',
          relevance: 85 - (index * 5),
          source: 'industry'
        });
      });

      // Add keyword suggestions
      data.keywords.forEach((keyword, index) => {
        suggestions.push({
          id: `keyword-${keyword}`,
          title: keyword,
          description: `Important keyword for ${data.name} roles`,
          category: 'keyword',
          relevance: 80 - (index * 3),
          source: 'industry'
        });
      });

      // Add template suggestions
      data.templates.forEach((template, index) => {
        suggestions.push({
          id: `template-${template}`,
          title: template,
          description: `Recommended template for ${data.name} professionals`,
          category: 'template',
          relevance: 75 - (index * 10),
          source: 'industry'
        });
      });

      // Add section suggestions
      data.sections.forEach((section, index) => {
        suggestions.push({
          id: `section-${section}`,
          title: section,
          description: `Important section for ${data.name} resumes`,
          category: 'section',
          relevance: 70 - (index * 5),
          source: 'industry'
        });
      });
    }

    // Add common suggestions
    const commonSuggestions: JobSuggestion[] = [
      {
        id: 'common-leadership',
        title: 'Leadership Experience',
        description: 'Highlight any leadership or management experience',
        category: 'section',
        relevance: 60,
        source: 'common'
      },
      {
        id: 'common-certifications',
        title: 'Certifications',
        description: 'Include relevant professional certifications',
        category: 'section',
        relevance: 55,
        source: 'common'
      },
      {
        id: 'common-projects',
        title: 'Projects',
        description: 'Showcase relevant projects and achievements',
        category: 'section',
        relevance: 50,
        source: 'common'
      }
    ];

    suggestions.push(...commonSuggestions);

    // Filter and sort suggestions
    return suggestions
      .filter(s => s.relevance >= minRelevance)
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, maxSuggestions);
  }, [enabled, minRelevance, maxSuggestions]);

  // Detect industry from job title
  const detectIndustryFromTitle = useCallback((title: string): string | null => {
    const normalizedTitle = title.toLowerCase();
    
    for (const [jobTitle, industry] of Object.entries(jobTitleMapping)) {
      if (normalizedTitle.includes(jobTitle)) {
        return industry;
      }
    }
    
    return null;
  }, []);

  // Get suggestions for current context
  const currentSuggestions = useMemo(() => {
    return getSuggestions(jobTitle, industry);
  }, [jobTitle, industry, getSuggestions]);

  // Select suggestion
  const selectSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => new Set([...prev, suggestionId]));
  }, []);

  // Deselect suggestion
  const deselectSuggestion = useCallback((suggestionId: string) => {
    setSelectedSuggestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(suggestionId);
      return newSet;
    });
  }, []);

  // Get selected suggestions
  const getSelectedSuggestions = useCallback(() => {
    return currentSuggestions.filter(s => selectedSuggestions.has(s.id));
  }, [currentSuggestions, selectedSuggestions]);

  // Clear all selections
  const clearSelections = useCallback(() => {
    setSelectedSuggestions(new Set());
  }, []);

  // Get industry recommendations
  const getIndustryRecommendations = useCallback(() => {
    if (!industry) return [];
    
    const data = industryData[industry];
    if (!data) return [];

    return {
      skills: data.commonSkills,
      achievements: data.achievements,
      keywords: data.keywords,
      templates: data.templates,
      sections: data.sections
    };
  }, [industry]);

  return {
    // State
    jobTitle,
    setJobTitle,
    industry,
    setIndustry,
    selectedSuggestions: Array.from(selectedSuggestions),
    
    // Data
    currentSuggestions,
    getSelectedSuggestions,
    getIndustryRecommendations,
    
    // Actions
    selectSuggestion,
    deselectSuggestion,
    clearSelections,
    
    // Utilities
    detectIndustryFromTitle,
    getSuggestions,
    
    // Configuration
    config: { enabled, autoSuggest, maxSuggestions, minRelevance }
  };
};
