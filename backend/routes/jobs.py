from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime

from schemas.requests import JobSearchRequest, JobFilterRequest
from schemas.responses import JobSearchResponse, JobMatchAnalysis, JobPostingResponse, JobSource
from models import User
from routes.auth import get_current_user
from utils.rate_limiter import rate_limit_user
from job_scraper import job_scraper_service

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.post("/search", response_model=JobSearchResponse, dependencies=[Depends(rate_limit_user(60, 60))])
async def search_jobs(request: JobSearchRequest, current_user: User = Depends(get_current_user)):
    """Search for jobs based on skills and filters"""
    try:
        filters = {
            'limit': request.limit,
            'min_salary': request.min_salary,
            'max_salary': request.max_salary,
            'job_type': request.job_type,
            'experience_level': request.experience_level,
            'remote': request.remote
        }
        
        jobs = await job_scraper_service.search_jobs_by_skills(request.skills, filters)
        
        return JobSearchResponse(
            jobs=[JobPostingResponse(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                description=job.description,
                requirements=job.requirements,
                skills=job.skills,
                salary_range=job.salary_range,
                job_type=job.job_type,
                experience_level=job.experience_level,
                posted_date=job.posted_date,
                application_url=job.application_url,
                source=job.source,
                remote=job.remote,
                match_score=job.match_score
            ) for job in jobs],
            total_count=len(jobs),
            filters_applied=filters
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@router.get("/search", response_model=JobSearchResponse, dependencies=[Depends(rate_limit_user(60, 60))])
async def search_jobs_get(
    skills: str = Query(..., description="Comma-separated list of skills"),
    location: Optional[str] = Query(None, description="Preferred location"),
    remote: bool = Query(True, description="Include remote jobs"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of jobs to return"),
    min_salary: Optional[int] = Query(None, ge=0, description="Minimum salary requirement"),
    max_salary: Optional[int] = Query(None, ge=0, description="Maximum salary requirement"),
    job_type: Optional[str] = Query(None, description="Type of job"),
    experience_level: Optional[str] = Query(None, description="Experience level required"),
    current_user: User = Depends(get_current_user)
):
    """Search for jobs using GET request with query parameters"""
    try:
        # Parse skills from comma-separated string
        skills_list = [skill.strip() for skill in skills.split(',') if skill.strip()]
        
        if not skills_list:
            raise HTTPException(status_code=400, detail="At least one skill is required")
        
        filters = {
            'limit': limit,
            'min_salary': min_salary,
            'max_salary': max_salary,
            'job_type': job_type,
            'experience_level': experience_level,
            'remote': remote
        }
        
        jobs = await job_scraper_service.search_jobs_by_skills(skills_list, filters)
        
        return JobSearchResponse(
            jobs=[JobPostingResponse(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                description=job.description,
                requirements=job.requirements,
                skills=job.skills,
                salary_range=job.salary_range,
                job_type=job.job_type,
                experience_level=job.experience_level,
                posted_date=job.posted_date,
                application_url=job.application_url,
                source=job.source,
                remote=job.remote,
                match_score=job.match_score
            ) for job in jobs],
            total_count=len(jobs),
            filters_applied=filters
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@router.get("/search-by-resume", response_model=JobSearchResponse, dependencies=[Depends(rate_limit_user(60, 60))])
async def search_jobs_by_resume(
    location: Optional[str] = Query(None, description="Preferred location"),
    remote: bool = Query(True, description="Include remote jobs"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of jobs to return"),
    min_salary: Optional[int] = Query(None, ge=0, description="Minimum salary requirement"),
    max_salary: Optional[int] = Query(None, ge=0, description="Maximum salary requirement"),
    current_user: User = Depends(get_current_user)
):
    """Search for jobs using skills from the authenticated user's resume"""
    try:
        # Get user's resume skills
        if not current_user.resume or not current_user.resume.skills:
            raise HTTPException(status_code=400, detail="No skills found in user's resume")
        
        skills = current_user.resume.skills
        
        filters = {
            'limit': limit,
            'min_salary': min_salary,
            'max_salary': max_salary,
            'remote': remote
        }
        
        jobs = await job_scraper_service.search_jobs_by_skills(skills, filters)
        
        return JobSearchResponse(
            jobs=[JobPostingResponse(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                description=job.description,
                requirements=job.requirements,
                skills=job.skills,
                salary_range=job.salary_range,
                job_type=job.job_type,
                experience_level=job.experience_level,
                posted_date=job.posted_date,
                application_url=job.application_url,
                source=job.source,
                remote=job.remote,
                match_score=job.match_score
            ) for job in jobs],
            total_count=len(jobs),
            filters_applied=filters
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching jobs: {str(e)}")

@router.get("/{job_id}/analysis", response_model=JobMatchAnalysis, dependencies=[Depends(rate_limit_user(60, 60))])
async def analyze_job_match(job_id: str, current_user: User = Depends(get_current_user)):
    """Analyze how well a specific job matches the user's resume"""
    try:
        if not current_user.resume or not current_user.resume.skills:
            raise HTTPException(status_code=400, detail="No skills found in user's resume")
        
        user_skills = current_user.resume.skills
        
        # Mock analysis - in a real implementation, you'd fetch the job details
        # and perform a detailed analysis
        skill_matches = [skill for skill in user_skills if skill.lower() in ['python', 'javascript', 'react']]
        missing_skills = ['Machine Learning', 'Docker', 'Kubernetes']
        recommendations = [
            "Consider learning Docker for containerization",
            "Explore Kubernetes for orchestration",
            "Take a Machine Learning course to expand your skillset"
        ]
        
        return JobMatchAnalysis(
            job_id=job_id,
            overall_match=75.5,
            skill_matches=skill_matches,
            missing_skills=missing_skills,
            recommendations=recommendations,
            match_breakdown={
                "technical_skills": 80.0,
                "experience_level": 70.0,
                "location_match": 90.0,
                "salary_expectations": 65.0
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing job match: {str(e)}")

@router.get("/sources", dependencies=[Depends(rate_limit_user(120, 60))])
async def get_job_sources():
    """Get list of available job sources"""
    sources = [
        JobSource(
            name="Indeed",
            description="Leading job search platform with millions of job listings",
            url="https://indeed.com",
            active=True
        ),
        JobSource(
            name="LinkedIn",
            description="Professional networking and job search platform",
            url="https://linkedin.com/jobs",
            active=True
        ),
        JobSource(
            name="Glassdoor",
            description="Job search with company reviews and salary information",
            url="https://glassdoor.com",
            active=True
        )
    ]
    
    return {"sources": sources}
