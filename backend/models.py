from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    gpa: Optional[str] = None

class Experience(BaseModel):
    company: str
    position: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    description: List[str] = []
    is_current: bool = False

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

class Resume(BaseModel):
    personal_info: dict = {
        "full_name": "",
        "email": "",
        "phone": "",
        "location": "",
        "linkedin": "",
        "github": "",
        "website": ""
    }
    professional_summary: str = ""
    skills: List[str] = []
    experience: List[Experience] = []
    education: List[Education] = []
    projects: List[Project] = []
    certifications: List[Certification] = []

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

class User(BaseModel):
    id: int
    email: str
    hashed_password: str

class CreateUser(BaseModel):
    email: str
    hashed_password: str
