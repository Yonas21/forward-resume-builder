import openai
import json
from typing import Dict, Any
from models import Resume, JobDescription
import os
from dotenv import load_dotenv

load_dotenv()

class OpenAIService:
    def __init__(self):
        openai.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
    
    async def parse_resume(self, resume_text: str) -> Resume:
        """Parse resume text and extract structured information"""
        
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
        
        Return only valid JSON without any additional text or formatting.
        """
        
        try:
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a resume parsing expert. Extract structured information from resumes and return valid JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.1
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
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writer. Optimize resumes to match job descriptions while maintaining accuracy and professionalism."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3
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
            response = openai.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a professional resume writer. Create resume templates that match job requirements."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.5
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

openai_service = OpenAIService()
