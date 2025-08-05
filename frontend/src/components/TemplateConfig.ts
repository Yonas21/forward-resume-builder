import { 
  BasicTemplate,
  ModernTemplate,
  ProfessionalTemplate,
  TechnicalTemplate,
  DataAnalystTemplate,
  DataEngineerTemplate,
  MarketingTemplate
} from './ResumeTemplates';
import type { TemplateOption } from './ResumeTemplates';

export const templates: TemplateOption[] = [
  {
    id: 'basic',
    name: 'Basic',
    profession: 'General',
    component: BasicTemplate,
    thumbnail: 'basic-template.png',
  },
  {
    id: 'modern',
    name: 'Modern',
    profession: 'Creative & Tech',
    component: ModernTemplate,
    thumbnail: 'modern-template.png',
  },
  {
    id: 'professional',
    name: 'Professional',
    profession: 'Business & Legal',
    component: ProfessionalTemplate,
    thumbnail: 'professional-template.png',
  },
  {
    id: 'technical',
    name: 'Technical',
    profession: 'Software Developer',
    component: TechnicalTemplate,
    thumbnail: 'technical-template.png',
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    profession: 'Data Analyst',
    component: DataAnalystTemplate,
    thumbnail: 'data-analyst-template.png',
  },
  {
    id: 'data-engineer',
    name: 'Data Engineer',
    profession: 'Data Engineer',
    component: DataEngineerTemplate,
    thumbnail: 'data-engineer-template.png',
  },
  {
    id: 'marketing',
    name: 'Marketing Professional',
    profession: 'Marketing',
    component: MarketingTemplate,
    thumbnail: 'marketing-template.png',
  }
];