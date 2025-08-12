
import { useState } from 'react';
import { useResumeStore } from '../store/resumeStore';
import { apiService } from '../services/api';

export const useAiSummary = () => {
  const { resume, updateProfessionalSummary } = useResumeStore();
  const [isAiLoading, setIsAiLoading] = useState(false);

  const generateAiSummary = async () => {
    if (!resume) return;

    setIsAiLoading(true);
    try {
      const userBackground = `
        Skills: ${resume.skills.map(s => `${s.name} (${s.level})`).join(', ')}
        Experience: ${resume.experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}
        Education: ${resume.education.map(edu => `${edu.degree} in ${edu.field_of_study} from ${edu.institution}`).join(', ')}
      `.trim();

      const fakeJobDescription = {
        title: "Professional Role",
        company: "Generic Company",
        description: "Looking for a skilled professional",
        requirements: resume.skills.slice(0, 3).map(s => s.name)
      };

      const response = await apiService.generateResume({
        job_description: fakeJobDescription,
        user_background: userBackground
      });

      if (response?.professional_summary) {
        updateProfessionalSummary(response.professional_summary);
      } else {
        const aiSummary = `Results-driven professional with expertise in ${resume.skills.slice(0, 3).map(s => s.name).join(', ')} and proven track record of delivering high-impact solutions. Passionate about innovation and continuous learning.`;
        updateProfessionalSummary(aiSummary);
      }
    } catch (error) {
      console.error('Error generating AI summary:', error);
      const aiSummary = `Experienced professional with strong background in ${resume.skills.slice(0, 3).map(s => s.name).join(', ')}. Demonstrated ability to deliver results and drive innovation in dynamic environments.`;
      updateProfessionalSummary(aiSummary);
    } finally {
      setIsAiLoading(false);
    }
  };

  return { generateAiSummary, isAiLoading };
};
