import { useState, useCallback } from 'react';

export interface HelpTip {
  id: string;
  title: string;
  content: string;
  category: 'general' | 'section' | 'field' | 'template' | 'industry';
  priority: 'low' | 'medium' | 'high';
  keywords?: string[];
  conditions?: {
    fieldValue?: string;
    section?: string;
    template?: string;
    industry?: string;
  };
}

export interface ContextualHelpState {
  activeTip: HelpTip | null;
  isVisible: boolean;
  position: { x: number; y: number };
  targetElement: HTMLElement | null;
}

export interface ContextualHelpConfig {
  enabled?: boolean;
  autoShow?: boolean;
  delayMs?: number;
  maxTipsPerSession?: number;
}

export const useContextualHelp = (config: ContextualHelpConfig = {}) => {
  const {
    enabled = true,
    autoShow = true,
    delayMs = 3000,
    maxTipsPerSession = 5
  } = config;

  const [state, setState] = useState<ContextualHelpState>({
    activeTip: null,
    isVisible: false,
    position: { x: 0, y: 0 },
    targetElement: null
  });

  const [shownTips, setShownTips] = useState<Set<string>>(new Set());
  const [helpHistory, setHelpHistory] = useState<HelpTip[]>([]);

  // Predefined help tips
  const helpTips: HelpTip[] = [
    // Personal Information Tips
    {
      id: 'personal-name',
      title: 'Professional Name',
      content: 'Use your full legal name as it appears on official documents. Avoid nicknames unless they\'re commonly used in your industry.',
      category: 'field',
      priority: 'high',
      keywords: ['name', 'full name', 'legal name'],
      conditions: { section: 'personal' }
    },
    {
      id: 'personal-email',
      title: 'Professional Email',
      content: 'Use a professional email address. Consider creating a dedicated email for job applications (e.g., firstname.lastname@email.com).',
      category: 'field',
      priority: 'high',
      keywords: ['email', 'professional email'],
      conditions: { section: 'personal' }
    },
    {
      id: 'personal-phone',
      title: 'Phone Number',
      content: 'Include your primary phone number. Ensure your voicemail is professional and you\'re available to answer calls.',
      category: 'field',
      priority: 'medium',
      keywords: ['phone', 'mobile', 'contact'],
      conditions: { section: 'personal' }
    },
    {
      id: 'personal-location',
      title: 'Location',
      content: 'Include your city and state. If you\'re open to relocation, you can mention this in your summary section.',
      category: 'field',
      priority: 'medium',
      keywords: ['location', 'city', 'address'],
      conditions: { section: 'personal' }
    },

    // Summary Tips
    {
      id: 'summary-content',
      title: 'Professional Summary',
      content: 'Write a compelling 2-3 sentence summary that highlights your key strengths, years of experience, and career objectives. Tailor it to the specific role you\'re applying for.',
      category: 'section',
      priority: 'high',
      keywords: ['summary', 'objective', 'profile'],
      conditions: { section: 'summary' }
    },
    {
      id: 'summary-length',
      title: 'Summary Length',
      content: 'Keep your summary concise - 2-3 sentences maximum. Focus on your most relevant achievements and skills.',
      category: 'section',
      priority: 'medium',
      keywords: ['length', 'concise', 'brief'],
      conditions: { section: 'summary' }
    },

    // Experience Tips
    {
      id: 'experience-format',
      title: 'Experience Format',
      content: 'Use reverse chronological order (most recent first). Include company name, job title, dates, and location. Use bullet points for responsibilities and achievements.',
      category: 'section',
      priority: 'high',
      keywords: ['experience', 'work history', 'employment'],
      conditions: { section: 'experience' }
    },
    {
      id: 'experience-achievements',
      title: 'Quantify Achievements',
      content: 'Use specific numbers and metrics when possible. Instead of "increased sales," say "increased sales by 25% over 6 months."',
      category: 'section',
      priority: 'high',
      keywords: ['achievements', 'metrics', 'numbers', 'results'],
      conditions: { section: 'experience' }
    },
    {
      id: 'experience-action-verbs',
      title: 'Action Verbs',
      content: 'Start bullet points with strong action verbs: developed, implemented, managed, created, improved, increased, reduced, etc.',
      category: 'section',
      priority: 'medium',
      keywords: ['action verbs', 'verbs', 'start'],
      conditions: { section: 'experience' }
    },

    // Skills Tips
    {
      id: 'skills-categorization',
      title: 'Skill Categories',
      content: 'Organize skills into categories like Technical Skills, Soft Skills, Languages, etc. This makes your resume more scannable.',
      category: 'section',
      priority: 'medium',
      keywords: ['skills', 'categories', 'organization'],
      conditions: { section: 'skills' }
    },
    {
      id: 'skills-relevance',
      title: 'Relevant Skills',
      content: 'Focus on skills that are directly relevant to the job you\'re applying for. Research the job description to identify key requirements.',
      category: 'section',
      priority: 'high',
      keywords: ['relevant', 'job requirements', 'matching'],
      conditions: { section: 'skills' }
    },

    // Education Tips
    {
      id: 'education-format',
      title: 'Education Format',
      content: 'Include degree, major, institution, graduation date, and GPA (if 3.5+). List most recent education first.',
      category: 'section',
      priority: 'medium',
      keywords: ['education', 'degree', 'university'],
      conditions: { section: 'education' }
    },

    // General Tips
    {
      id: 'general-length',
      title: 'Resume Length',
      content: 'Keep your resume to 1-2 pages. For most professionals, one page is sufficient. Use concise language and remove unnecessary details.',
      category: 'general',
      priority: 'high',
      keywords: ['length', 'pages', 'concise']
    },
    {
      id: 'general-keywords',
      title: 'Keyword Optimization',
      content: 'Include relevant keywords from the job description. Many companies use ATS (Applicant Tracking Systems) that scan for specific terms.',
      category: 'general',
      priority: 'high',
      keywords: ['keywords', 'ATS', 'scanning', 'matching']
    },
    {
      id: 'general-proofread',
      title: 'Proofreading',
      content: 'Always proofread your resume carefully. Spelling and grammar errors can immediately disqualify you from consideration.',
      category: 'general',
      priority: 'high',
      keywords: ['proofread', 'spelling', 'grammar', 'errors']
    }
  ];

  // Show help tip
  const showTip = useCallback((tip: HelpTip, element?: HTMLElement) => {
    if (!enabled || shownTips.size >= maxTipsPerSession) return;

    const position = element ? calculatePosition(element) : { x: 0, y: 0 };
    
    setState({
      activeTip: tip,
      isVisible: true,
      position,
      targetElement: element || null
    });

    setShownTips(prev => new Set([...prev, tip.id]));
    setHelpHistory(prev => [...prev, tip]);
  }, [enabled, shownTips.size, maxTipsPerSession]);

  // Hide help tip
  const hideTip = useCallback(() => {
    setState(prev => ({ ...prev, isVisible: false }));
  }, []);

  // Get contextual tips based on current context
  const getContextualTips = useCallback((context: {
    section?: string;
    field?: string;
    value?: string;
    template?: string;
    industry?: string;
  }) => {
    return helpTips.filter(tip => {
      // Check if tip matches current context
      if (tip.conditions?.section && tip.conditions.section !== context.section) {
        return false;
      }
      if (tip.conditions?.template && tip.conditions.template !== context.template) {
        return false;
      }
      if (tip.conditions?.industry && tip.conditions.industry !== context.industry) {
        return false;
      }

      // Check if tip keywords match current field or value
      if (context.field && tip.keywords) {
        const fieldMatch = tip.keywords.some(keyword => 
          context.field?.toLowerCase().includes(keyword.toLowerCase())
        );
        if (fieldMatch) return true;
      }

      if (context.value && tip.keywords) {
        const valueMatch = tip.keywords.some(keyword => 
          context.value?.toLowerCase().includes(keyword.toLowerCase())
        );
        if (valueMatch) return true;
      }

      return true;
    }).sort((a, b) => {
      // Sort by priority and whether it's been shown
      const aShown = shownTips.has(a.id);
      const bShown = shownTips.has(b.id);
      
      if (aShown && !bShown) return 1;
      if (!aShown && bShown) return -1;
      
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }, [helpTips, shownTips]);

  // Auto-show contextual tip
  const autoShowTip = useCallback((context: {
    section?: string;
    field?: string;
    value?: string;
    template?: string;
    industry?: string;
  }, element?: HTMLElement) => {
    if (!autoShow) return;

    const contextualTips = getContextualTips(context);
    const unshownTips = contextualTips.filter(tip => !shownTips.has(tip.id));
    
    if (unshownTips.length > 0) {
      setTimeout(() => {
        showTip(unshownTips[0], element);
      }, delayMs);
    }
  }, [autoShow, getContextualTips, shownTips, delayMs, showTip]);

  // Calculate tooltip position
  const calculatePosition = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.bottom + 10
    };
  };

  // Get help history
  const getHelpHistory = useCallback(() => {
    return helpHistory;
  }, [helpHistory]);

  // Reset help session
  const resetSession = useCallback(() => {
    setShownTips(new Set());
    setHelpHistory([]);
    hideTip();
  }, [hideTip]);

  // Get help statistics
  const getHelpStats = useCallback(() => {
    return {
      totalTips: helpTips.length,
      shownTips: shownTips.size,
      maxTips: maxTipsPerSession,
      helpHistory: helpHistory.length
    };
  }, [helpTips.length, shownTips.size, maxTipsPerSession, helpHistory.length]);

  return {
    // State
    ...state,
    
    // Actions
    showTip,
    hideTip,
    autoShowTip,
    resetSession,
    
    // Data
    getContextualTips,
    getHelpHistory,
    getHelpStats,
    
    // Configuration
    config: { enabled, autoShow, delayMs, maxTipsPerSession }
  };
};
