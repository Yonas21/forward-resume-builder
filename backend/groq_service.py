import json
import os
from typing import Dict, Any

from models import Resume
from core.config import settings

try:
    from groq import Groq
except ImportError:
    Groq = None

class GroqService:
    def __init__(self):
        if Groq is None:
            raise ImportError("The 'groq' library is not installed. Please install it with 'pip install groq'")
        
        self.model = settings.groq_model
        self._client = Groq(api_key=settings.groq_api_key)
    
    async def parse_resume(self, resume_text: str, pre_processed_hints: Dict[str, Any] = None) -> Resume:
        """Parse resume text and extract structured information using Groq
        
        Args:
            resume_text: The raw text extracted from the resume
            pre_processed_hints: Pre-processed structured data to help guide the AI parsing
        """
        
        hints_text = ""
        if pre_processed_hints:
            hints_text = "\nPre-processed information to help with parsing:\n"
            
            if "detected_sections" in pre_processed_hints and pre_processed_hints["detected_sections"]:
                hints_text += f"Detected sections: {', '.join(pre_processed_hints['detected_sections'])}\n"
            
            if "email" in pre_processed_hints:
                hints_text += f"Detected email: {pre_processed_hints['email']}\n"
            if "phone" in pre_processed_hints:
                hints_text += f"Detected phone: {pre_processed_hints['phone']}\n"
            if "name" in pre_processed_hints:
                hints_text += f"Detected name: {pre_processed_hints['name']}\n"
            
            if "sections" in pre_processed_hints:
                for section_name, content in pre_processed_hints["sections"].items():
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
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
            
            parsed_data = json.loads(content)
            return Resume(**parsed_data)
            
        except Exception as e:
            print(f"Error parsing resume with Groq: {e}")
            return Resume()

groq_service = GroqService()
