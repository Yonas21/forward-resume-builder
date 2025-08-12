
import React from 'react';
import { sections } from '../../utils/settings';
import {
  PersonalInfoForm,
  ProfessionalSummaryForm,
  SkillsForm,
  ExperienceForm,
  EducationForm,
  ProjectsForm,
  CertificationsForm,
} from '../forms/ResumeForms';

interface MainContentProps {
  activeSection: string;
  generateAiSummary: () => void;
  isAiLoading: boolean;
}

const formComponents: { [key: string]: React.ElementType } = {
  personal: PersonalInfoForm,
  summary: ProfessionalSummaryForm,
  skills: SkillsForm,
  experience: ExperienceForm,
  education: EducationForm,
  projects: ProjectsForm,
  certifications: CertificationsForm,
};

export const MainContent: React.FC<MainContentProps> = ({ activeSection, generateAiSummary, isAiLoading }) => {
  const ActiveFormComponent = formComponents[activeSection];

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <span className="mr-3">{sections[activeSection as keyof typeof sections]?.icon}</span>
            {sections[activeSection as keyof typeof sections]?.name}
          </h2>
        </div>

        <div className="space-y-6">
          {ActiveFormComponent && (
            <ActiveFormComponent generateAiSummary={generateAiSummary} isAiLoading={isAiLoading} />
          )}
        </div>
      </div>
    </div>
  );
};
