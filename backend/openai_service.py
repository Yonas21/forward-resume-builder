import json
import os
from typing import Dict, Any
from datetime import date

from models import Resume, JobDescription
from core.config import settings

try:
    # New SDK style; if unavailable, fallback will be handled in calls
    from openai import OpenAI
except Exception:  # pragma: no cover - fallback import for older SDKs
    OpenAI = None  # type: ignore


class OpenAIService:
    def __init__(self):
        self.model = settings.openai_model
        self._client = OpenAI(api_key=settings.openai_api_key) if OpenAI else None
    
    async def parse_resume(self, resume_text: str, pre_processed_hints: Dict[str, Any] = None) -> Resume:
        """Parse resume text and extract structured information
        
        Args:
            resume_text: The raw text extracted from the resume
            pre_processed_hints: Pre-processed structured data to help guide the AI parsing
        """
        
        # Prepare hints from pre-processed data if available
        hints_text = ""
        if pre_processed_hints:
            hints_text = "\nPre-processed information to help with parsing:\n"
            
            # Add detected sections
            if "detected_sections" in pre_processed_hints and pre_processed_hints["detected_sections"]:
                hints_text += f"Detected sections: {', '.join(pre_processed_hints['detected_sections'])}\n"
            
            # Add extracted contact info
            if "email" in pre_processed_hints:
                hints_text += f"Detected email: {pre_processed_hints['email']}\n"
            if "phone" in pre_processed_hints:
                hints_text += f"Detected phone: {pre_processed_hints['phone']}\n"
            if "name" in pre_processed_hints:
                hints_text += f"Detected name: {pre_processed_hints['name']}\n"
            
            # Add section content hints
            if "sections" in pre_processed_hints:
                for section_name, content in pre_processed_hints["sections"].items():
                    # Only include a preview of each section to keep prompt size reasonable
                    content_preview = content[:200] + "..." if len(content) > 200 else content
                    hints_text += f"\nDetected {section_name} section content preview:\n{content_preview}\n"
        
        prompt = f"""
        Parse the following resume text and extract structured information. Return a JSON object with the following structure:
        {{
            "personal_info": {{
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "linkedin": "",
                "github": "",
                "website": ""
            }},
            "professional_summary": "",
            "skills": [],
            "experience": [
                {{
                    "company": "",
                    "position": "",
                    "start_date": "YYYY-MM-DD or null",
                    "end_date": "YYYY-MM-DD or null",
                    "description": [],
                    "is_current": false
                }}
            ],
            "education": [
                {{
                    "institution": "",
                    "degree": "",
                    "field_of_study": "",
                    "start_date": "YYYY-MM-DD or null",
                    "end_date": "YYYY-MM-DD or null",
                    "gpa": ""
                }}
            ],
            "projects": [
                {{
                    "name": "",
                    "description": "",
                    "technologies": [],
                    "url": ""
                }}
            ],
            "certifications": [
                {{
                    "name": "",
                    "issuing_organization": "",
                    "issue_date": "YYYY-MM-DD or null",
                    "expiration_date": "YYYY-MM-DD or null",
                    "credential_id": ""
                }}
            ]
        }}

        Resume text:
        {resume_text}
        {hints_text}
        
        Return only valid JSON without any additional text or formatting.
        """
        
        try:
            if not self._client:
                raise RuntimeError("OpenAI client not initialized")

            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a resume parsing expert. Extract structured information from resumes and return valid JSON. Pay special attention to the pre-processed hints provided, but verify all information against the original text."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1,
                timeout=30,
            )

            content = response.choices[0].message.content.strip()
            # Remove any markdown formatting if present
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            parsed_data = json.loads(content)
            return Resume(**parsed_data)
            
        except Exception as e:
            # Consider raising a typed error for upstream handling
            print(f"Error parsing resume: {e}")
            return Resume()
    
    async def optimize_resume_for_job(self, resume: Resume, job_description: JobDescription) -> Resume:
        """Optimize resume based on job description"""
        
        resume_json = resume.model_dump()
        
        prompt = f"""
        Optimize the following resume for this job description. Focus on:
        1. Tailoring the professional summary to match the role
        2. Highlighting relevant skills and experience
        3. Rewriting experience descriptions to emphasize relevant achievements
        4. Suggesting relevant keywords from the job description
        
        Job Description:
        Title: {job_description.title}
        Company: {job_description.company}
        Description: {job_description.description}
        Requirements: {', '.join(job_description.requirements)}
        
        Current Resume:
        {json.dumps(resume_json, indent=2)}
        
        Return the optimized resume in the same JSON format. Keep all existing information but enhance it for this specific role.
        """
        
        try:
            if not self._client:
                raise RuntimeError("OpenAI client not initialized")

            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writer. Optimize resumes to match job descriptions while maintaining accuracy and professionalism."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                timeout=30,
            )

            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            optimized_data = json.loads(content)
            return Resume(**optimized_data)
            
        except Exception as e:
            print(f"Error optimizing resume: {e}")
            return resume
    
    async def generate_resume_from_job(self, job_description: JobDescription, user_background: str = None) -> Resume:
        """Generate a resume template based on job description"""
        
        background_context = f"User background: {user_background}" if user_background else "No specific background provided."
        
        prompt = f"""
        Create a resume template based on this job description and user background. Generate realistic but generic content that matches the role requirements.
        
        Job Description:
        Title: {job_description.title}
        Company: {job_description.company}
        Description: {job_description.description}
        Requirements: {', '.join(job_description.requirements)}
        
        {background_context}
        
        Create a resume with:
        1. Professional summary tailored to the role
        2. Relevant skills extracted from job requirements
        3. 2-3 sample work experiences that would be relevant
        4. Sample education background
        5. 1-2 relevant projects
        
        Return in this JSON format:
        {{
            "personal_info": {{
                "full_name": "[Your Name]",
                "email": "[Your Email]",
                "phone": "[Your Phone]",
                "location": "[Your Location]",
                "linkedin": "[LinkedIn URL]",
                "github": "[GitHub URL]",
                "website": "[Website URL]"
            }},
            "professional_summary": "",
            "skills": [],
            "experience": [],
            "education": [],
            "projects": [],
            "certifications": []
        }}
        """
        
        try:
            if not self._client:
                raise RuntimeError("OpenAI client not initialized")

            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writer. Create resume templates that match job requirements."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5,
                timeout=30,
            )

            content = response.choices[0].message.content.strip()
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            generated_data = json.loads(content)
            return Resume(**generated_data)
            
        except Exception as e:
            print(f"Error generating resume: {e}")
            return Resume()

    async def generate_cover_letter(self, resume: Resume, job_description: JobDescription) -> str:
        """Generate a cover letter based on the resume and job description."""
        
        def date_serializer(obj):
            if isinstance(obj, date):
                return obj.isoformat()
            raise TypeError(f"Object of type {type(obj)} is not JSON serializable")

        resume_json = resume.model_dump()

        prompt = f"""
        Generate a professional cover letter based on the following resume and job description.

        The cover letter should be:
        - Tailored to the specific job description.
        - Highlight the most relevant skills and experiences from the resume.
        - Written in a professional and engaging tone.
        - Formatted as a standard cover letter with a clear introduction, body, and conclusion.

        Job Description:
        Title: {job_description.title}
        Company: {job_description.company}
        Description: {job_description.description}
        Requirements: {', '.join(job_description.requirements)}

        Resume:
        {json.dumps(resume_json, indent=2, default=date_serializer)}

        Return only the cover letter text.
        """
        
        try:
            if not self._client:
                raise RuntimeError("OpenAI client not initialized")

            response = self._client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional career coach and expert cover letter writer."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                timeout=120,
            )

            cover_letter_text = response.choices[0].message.content.strip()
            return cover_letter_text
            
        except Exception as e:
            print(f"Error generating cover letter: {e}")
            return "Error generating cover letter."

openai_service = OpenAIService()
