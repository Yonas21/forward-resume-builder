from pydantic import BaseModel, field_validator
from typing import List, Optional, Union, Any
from datetime import date
from enum import Enum

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    gpa: Optional[str] = None
    
    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v: Any) -> Optional[date]:
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                return None
        return v

class Experience(BaseModel):
    company: str
    position: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: List[str] = []
    is_current: bool = False
    
    @field_validator('start_date', 'end_date', mode='before')
    @classmethod
    def validate_dates(cls, v: Any) -> Optional[date]:
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                return date.fromisoformat(v)
            except ValueError:
                return None
        return v

class Project(BaseModel):
    name: str
    description: str
    technologies: List[str] = []
    url: Optional[str] = None

class Certification(BaseModel):
    name: str
    issuing_organization: str
    issue_date: Optional[date] = None
    expiration_date: Optional[date] = None
    credential_id: Optional[str] = None

class SkillLevel(str, Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"
    expert = "expert"

class Skill(BaseModel):
    name: str
    category_id: str
    category: str
    level: SkillLevel

class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    github: str = ""
    website: str = ""

class Resume(BaseModel):
    personal_info: PersonalInfo = PersonalInfo()
    professional_summary: str = ""
    skills: List[Skill] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[Certification] = []
    
    @field_validator('skills', mode='before')
    @classmethod
    def validate_skills(cls, v: Any) -> List[Skill]:
        if not v:
            return []
        
        # Handle case where skills come as list of strings
        if isinstance(v, list) and v and isinstance(v[0], str):
            return [
                Skill(
                    name=skill_name,
                    category_id='technical',
                    category='Technical Skills',
                    level=SkillLevel.intermediate
                )
                for skill_name in v
                if skill_name and skill_name.strip()  # Filter out null/empty values
            ]
        
        # Handle case where skills come as list of dicts with null values
        if isinstance(v, list) and v and isinstance(v[0], dict):
            return [
                Skill(
                    name=skill.get('name', ''),
                    category_id=skill.get('category_id', 'technical'),
                    category=skill.get('category', 'Technical Skills'),
                    level=SkillLevel(skill.get('level', 'intermediate'))
                )
                for skill in v
                if skill and skill.get('name') and skill.get('name').strip()  # Filter out null/empty values
            ]
        
        return v

class JobDescription(BaseModel):
    title: str
    company: str
    description: str
    requirements: List[str] = []

class OptimizeResumeRequest(BaseModel):
    resume: Resume
    job_description: JobDescription

class ParseResumeRequest(BaseModel):
    resume_text: str

class GenerateResumeRequest(BaseModel):
    job_description: JobDescription
    user_background: Optional[str] = None

class GenerateCoverLetterRequest(BaseModel):
    resume: Resume
    job_description: JobDescription

class User(BaseModel):
    id: int
    email: str
    hashed_password: str

class CreateUser(BaseModel):
    email: str
    hashed_password: str
