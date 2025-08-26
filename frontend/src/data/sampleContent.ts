export interface SampleContent {
  id: string;
  title: string;
  content: string;
  category: string;
  industry?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export interface SampleSection {
  section: string;
  samples: SampleContent[];
}

// Sample content organized by sections and industries
export const sampleContent: Record<string, SampleSection> = {
  summary: {
    section: 'Professional Summary',
    samples: [
      {
        id: 'summary-tech-senior',
        title: 'Senior Software Engineer',
        content: 'Experienced software engineer with 8+ years developing scalable web applications and leading technical teams. Proven track record of delivering high-impact projects using modern technologies including React, Node.js, and cloud platforms. Passionate about clean code, system architecture, and mentoring junior developers.',
        category: 'summary',
        industry: 'technology',
        difficulty: 'advanced',
        tags: ['senior', 'leadership', 'technical']
      },
      {
        id: 'summary-tech-junior',
        title: 'Junior Developer',
        content: 'Recent computer science graduate with strong foundation in web development and passion for creating user-friendly applications. Proficient in JavaScript, React, and Node.js with experience in full-stack development. Eager to contribute to innovative projects and grow technical skills.',
        category: 'summary',
        industry: 'technology',
        difficulty: 'beginner',
        tags: ['junior', 'recent graduate', 'entry-level']
      },
      {
        id: 'summary-marketing',
        title: 'Digital Marketing Specialist',
        content: 'Results-driven digital marketing professional with 5+ years experience in campaign management, SEO optimization, and social media strategy. Successfully increased brand engagement by 200% and generated $2M+ in revenue through targeted marketing campaigns.',
        category: 'summary',
        industry: 'marketing',
        difficulty: 'intermediate',
        tags: ['digital marketing', 'campaigns', 'results']
      },
      {
        id: 'summary-finance',
        title: 'Financial Analyst',
        content: 'Detail-oriented financial analyst with expertise in financial modeling, budgeting, and investment analysis. Proven ability to analyze complex financial data and provide strategic recommendations that drive business growth and operational efficiency.',
        category: 'summary',
        industry: 'finance',
        difficulty: 'intermediate',
        tags: ['financial analysis', 'modeling', 'strategic']
      },
      {
        id: 'summary-healthcare',
        title: 'Registered Nurse',
        content: 'Compassionate registered nurse with 6+ years experience in patient care and clinical operations. Skilled in patient assessment, treatment planning, and healthcare coordination. Committed to providing high-quality care and improving patient outcomes.',
        category: 'summary',
        industry: 'healthcare',
        difficulty: 'intermediate',
        tags: ['patient care', 'clinical', 'healthcare']
      }
    ]
  },
  experience: {
    section: 'Work Experience',
    samples: [
      {
        id: 'exp-tech-senior',
        title: 'Senior Software Engineer - Tech Company',
        content: `• Led development of microservices architecture serving 1M+ daily users
• Managed team of 5 developers and delivered 3 major product releases
• Implemented CI/CD pipeline reducing deployment time by 60%
• Optimized database queries improving application performance by 40%
• Mentored 3 junior developers and conducted technical interviews`,
        category: 'experience',
        industry: 'technology',
        difficulty: 'advanced',
        tags: ['leadership', 'architecture', 'performance']
      },
      {
        id: 'exp-tech-junior',
        title: 'Junior Developer - Startup',
        content: `• Developed and maintained React-based web applications
• Collaborated with senior developers on feature implementation
• Participated in code reviews and agile development processes
• Fixed bugs and improved application performance
• Contributed to documentation and testing efforts`,
        category: 'experience',
        industry: 'technology',
        difficulty: 'beginner',
        tags: ['web development', 'collaboration', 'learning']
      },
      {
        id: 'exp-marketing',
        title: 'Digital Marketing Manager - Agency',
        content: `• Managed $500K+ monthly ad spend across multiple platforms
• Increased website traffic by 150% through SEO optimization
• Grew social media following by 200% in 6 months
• Launched successful email campaigns with 25% open rate
• Generated $2M+ in revenue through targeted marketing strategies`,
        category: 'experience',
        industry: 'marketing',
        difficulty: 'intermediate',
        tags: ['campaign management', 'growth', 'analytics']
      },
      {
        id: 'exp-finance',
        title: 'Financial Analyst - Corporation',
        content: `• Developed financial models for $50M acquisition deal
• Reduced operational costs by 25% through process optimization
• Created budget forecasting system improving accuracy by 30%
• Led audit team ensuring 100% compliance with regulations
• Managed $10M investment portfolio achieving 12% annual returns`,
        category: 'experience',
        industry: 'finance',
        difficulty: 'intermediate',
        tags: ['financial modeling', 'cost reduction', 'compliance']
      },
      {
        id: 'exp-healthcare',
        title: 'Registered Nurse - Hospital',
        content: `• Provided care for 50+ patients daily maintaining 100% safety record
• Reduced patient wait times by 30% through process improvement
• Led clinical team of 15 staff members
• Implemented new treatment protocols improving patient outcomes by 25%
• Maintained 100% compliance with healthcare regulations`,
        category: 'experience',
        industry: 'healthcare',
        difficulty: 'intermediate',
        tags: ['patient care', 'leadership', 'process improvement']
      }
    ]
  },
  skills: {
    section: 'Skills',
    samples: [
      {
        id: 'skills-tech-senior',
        title: 'Senior Developer Skills',
        content: `Technical Skills: JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, Kubernetes, PostgreSQL, MongoDB, Git, CI/CD, Microservices, System Design

Soft Skills: Team Leadership, Project Management, Technical Mentoring, Problem Solving, Communication, Agile Methodologies`,
        category: 'skills',
        industry: 'technology',
        difficulty: 'advanced',
        tags: ['technical', 'leadership', 'architecture']
      },
      {
        id: 'skills-tech-junior',
        title: 'Junior Developer Skills',
        content: `Programming Languages: JavaScript, HTML, CSS, Python
Frameworks & Libraries: React, Node.js, Express.js
Tools & Platforms: Git, VS Code, Chrome DevTools
Databases: MongoDB, SQLite
Other: REST APIs, Responsive Design, Version Control`,
        category: 'skills',
        industry: 'technology',
        difficulty: 'beginner',
        tags: ['programming', 'web development', 'tools']
      },
      {
        id: 'skills-marketing',
        title: 'Digital Marketing Skills',
        content: `Digital Marketing: Google Ads, Facebook Ads, SEO, Content Marketing, Email Marketing, Social Media Management
Analytics & Tools: Google Analytics, HubSpot, Mailchimp, Adobe Creative Suite, Hootsuite
Skills: Campaign Management, Data Analysis, A/B Testing, Brand Strategy, Lead Generation`,
        category: 'skills',
        industry: 'marketing',
        difficulty: 'intermediate',
        tags: ['digital marketing', 'analytics', 'campaigns']
      },
      {
        id: 'skills-finance',
        title: 'Financial Analysis Skills',
        content: `Technical Skills: Financial Modeling, Excel, QuickBooks, SAP, Bloomberg Terminal, SQL, VBA
Analysis: Risk Management, Financial Analysis, Budgeting, Forecasting, Valuation, Audit
Certifications: CFA Level I, CPA (in progress)`,
        category: 'skills',
        industry: 'finance',
        difficulty: 'intermediate',
        tags: ['financial analysis', 'modeling', 'certifications']
      },
      {
        id: 'skills-healthcare',
        title: 'Healthcare Skills',
        content: `Clinical Skills: Patient Care, Clinical Documentation, Medical Terminology, Patient Assessment, Treatment Planning
Technical Skills: Electronic Health Records, Medical Software, HIPAA Compliance, CPR Certification
Specializations: Emergency Care, Patient Education, Care Coordination`,
        category: 'skills',
        industry: 'healthcare',
        difficulty: 'intermediate',
        tags: ['clinical', 'patient care', 'compliance']
      }
    ]
  },
  education: {
    section: 'Education',
    samples: [
      {
        id: 'edu-tech-bs',
        title: 'Computer Science Degree',
        content: `Bachelor of Science in Computer Science
University of Technology | Graduated: 2023 | GPA: 3.8/4.0

Relevant Coursework: Data Structures & Algorithms, Software Engineering, Database Systems, Web Development, Machine Learning

Projects: Built a full-stack e-commerce platform using React and Node.js`,
        category: 'education',
        industry: 'technology',
        difficulty: 'beginner',
        tags: ['computer science', 'bachelor', 'projects']
      },
      {
        id: 'edu-marketing-ba',
        title: 'Marketing Degree',
        content: `Bachelor of Arts in Marketing
Business University | Graduated: 2022 | GPA: 3.6/4.0

Relevant Coursework: Digital Marketing, Consumer Behavior, Marketing Analytics, Brand Management, Social Media Marketing

Honors: Dean's List (3 semesters), Marketing Student of the Year`,
        category: 'education',
        industry: 'marketing',
        difficulty: 'beginner',
        tags: ['marketing', 'bachelor', 'honors']
      },
      {
        id: 'edu-finance-mba',
        title: 'MBA in Finance',
        content: `Master of Business Administration in Finance
Graduate Business School | Graduated: 2021 | GPA: 3.9/4.0

Relevant Coursework: Corporate Finance, Investment Analysis, Financial Modeling, Risk Management, Portfolio Management

Thesis: "Impact of ESG Factors on Investment Returns"`,
        category: 'education',
        industry: 'finance',
        difficulty: 'advanced',
        tags: ['mba', 'finance', 'graduate']
      },
      {
        id: 'edu-healthcare-bsn',
        title: 'Nursing Degree',
        content: `Bachelor of Science in Nursing
Nursing University | Graduated: 2023 | GPA: 3.7/4.0

Relevant Coursework: Anatomy & Physiology, Pharmacology, Patient Care, Health Assessment, Nursing Research

Clinical Experience: 500+ hours in various healthcare settings`,
        category: 'education',
        industry: 'healthcare',
        difficulty: 'beginner',
        tags: ['nursing', 'bachelor', 'clinical']
      }
    ]
  },
  projects: {
    section: 'Projects',
    samples: [
      {
        id: 'proj-tech-ecommerce',
        title: 'E-commerce Platform',
        content: `Full-stack e-commerce platform built with React, Node.js, and MongoDB
• Implemented user authentication, product catalog, and payment processing
• Deployed on AWS with CI/CD pipeline
• Handles 10,000+ daily users with 99.9% uptime
• Technologies: React, Node.js, MongoDB, AWS, Stripe`,
        category: 'projects',
        industry: 'technology',
        difficulty: 'intermediate',
        tags: ['full-stack', 'e-commerce', 'deployment']
      },
      {
        id: 'proj-marketing-campaign',
        title: 'Digital Marketing Campaign',
        content: `Comprehensive digital marketing campaign for local business
• Increased website traffic by 300% through SEO and PPC
• Generated 500+ qualified leads in 3 months
• Achieved 400% ROI on ad spend
• Tools: Google Ads, Facebook Ads, Google Analytics, HubSpot`,
        category: 'projects',
        industry: 'marketing',
        difficulty: 'intermediate',
        tags: ['campaign', 'lead generation', 'roi']
      },
      {
        id: 'proj-finance-model',
        title: 'Financial Model',
        content: `Comprehensive financial model for startup valuation
• Built 5-year financial projections with scenario analysis
• Incorporated market research and competitive analysis
• Used for $2M funding round
• Tools: Excel, VBA, Bloomberg Terminal`,
        category: 'projects',
        industry: 'finance',
        difficulty: 'advanced',
        tags: ['financial modeling', 'valuation', 'funding']
      }
    ]
  },
  certifications: {
    section: 'Certifications',
    samples: [
      {
        id: 'cert-tech-aws',
        title: 'AWS Certified Solutions Architect',
        content: `AWS Certified Solutions Architect - Associate
Issued: 2023 | Expires: 2026
Credential ID: AWS-123456789

Skills validated: Cloud architecture, AWS services, security, scalability, cost optimization`,
        category: 'certifications',
        industry: 'technology',
        difficulty: 'intermediate',
        tags: ['aws', 'cloud', 'architecture']
      },
      {
        id: 'cert-marketing-google',
        title: 'Google Ads Certification',
        content: `Google Ads Certification
Issued: 2023 | Expires: 2024
Credential ID: GOOGLE-987654321

Skills validated: Search advertising, display advertising, video advertising, shopping advertising`,
        category: 'certifications',
        industry: 'marketing',
        difficulty: 'beginner',
        tags: ['google ads', 'digital advertising', 'search']
      },
      {
        id: 'cert-finance-cfa',
        title: 'CFA Level I',
        content: `Chartered Financial Analyst (CFA) Level I
Issued: 2023 | Expires: N/A
Credential ID: CFA-456789123

Skills validated: Investment analysis, portfolio management, financial reporting, ethics`,
        category: 'certifications',
        industry: 'finance',
        difficulty: 'advanced',
        tags: ['cfa', 'investment', 'analysis']
      },
      {
        id: 'cert-healthcare-cpr',
        title: 'CPR Certification',
        content: `Basic Life Support (BLS) CPR Certification
Issued: 2023 | Expires: 2025
Credential ID: AHA-789123456

Skills validated: Cardiopulmonary resuscitation, automated external defibrillator use, emergency response`,
        category: 'certifications',
        industry: 'healthcare',
        difficulty: 'beginner',
        tags: ['cpr', 'emergency', 'life support']
      }
    ]
  }
};

// Helper functions to get sample content
export const getSampleContent = (section: string, industry?: string, difficulty?: string): SampleContent[] => {
  const sectionData = sampleContent[section];
  if (!sectionData) return [];

  let samples = sectionData.samples;

  if (industry) {
    samples = samples.filter(sample => sample.industry === industry);
  }

  if (difficulty) {
    samples = samples.filter(sample => sample.difficulty === difficulty);
  }

  return samples;
};

export const getSampleContentById = (id: string): SampleContent | null => {
  for (const section of Object.values(sampleContent)) {
    const sample = section.samples.find(s => s.id === id);
    if (sample) return sample;
  }
  return null;
};

export const getSampleContentByTags = (tags: string[]): SampleContent[] => {
  const allSamples: SampleContent[] = [];
  
  for (const section of Object.values(sampleContent)) {
    allSamples.push(...section.samples);
  }

  return allSamples.filter(sample => 
    tags.some(tag => sample.tags.includes(tag))
  );
};

export const getAvailableSections = (): string[] => {
  return Object.keys(sampleContent);
};

export const getAvailableIndustries = (): string[] => {
  const industries = new Set<string>();
  
  for (const section of Object.values(sampleContent)) {
    section.samples.forEach(sample => {
      if (sample.industry) {
        industries.add(sample.industry);
      }
    });
  }

  return Array.from(industries);
};
