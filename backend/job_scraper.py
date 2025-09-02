import asyncio
import random
from dataclasses import dataclass
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

@dataclass
class JobPosting:
    id: str
    title: str
    company: str
    location: str
    description: str
    requirements: List[str]
    skills: List[str]
    salary_range: Optional[str]
    job_type: str
    experience_level: str
    posted_date: datetime
    application_url: str
    source: str
    remote: bool
    match_score: Optional[float] = None

class JobScraperService:
    def __init__(self):
        self.session = None
        self.user_agents = [
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
        ]
        self.rate_limit_delay = 1.0  # seconds between requests
        
    async def __aenter__(self):
        return self
        
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def scrape_jobs(self, skills: List[str], location: str = "", remote: bool = True, limit: int = 50) -> List[JobPosting]:
        """Scrape jobs from multiple sources concurrently"""
        try:
            # Run scraping tasks concurrently
            tasks = [
                self._scrape_indeed(skills, location, remote, limit // 3),
                self._scrape_linkedin(skills, location, remote, limit // 3),
                self._scrape_glassdoor(skills, location, remote, limit // 3)
            ]
            
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Combine and deduplicate results
            all_jobs = []
            for result in results:
                if isinstance(result, list):
                    all_jobs.extend(result)
                else:
                    logger.warning(f"Scraping task failed: {result}")
            
            # Deduplicate and limit results
            unique_jobs = self._deduplicate_jobs(all_jobs)
            return unique_jobs[:limit]
            
        except Exception as e:
            logger.error(f"Error scraping jobs: {e}")
            return []
    
    async def _scrape_indeed(self, skills: List[str], location: str = "", remote: bool = True, limit: int = 20) -> List[JobPosting]:
        """Mock Indeed scraping"""
        await asyncio.sleep(0.1)  # Simulate network delay
        return self._create_mock_jobs("Indeed", skills, limit)
    
    async def _scrape_linkedin(self, skills: List[str], location: str = "", remote: bool = True, limit: int = 20) -> List[JobPosting]:
        """Mock LinkedIn scraping"""
        await asyncio.sleep(0.1)  # Simulate network delay
        return self._create_mock_jobs("LinkedIn", skills, limit)
    
    async def _scrape_glassdoor(self, skills: List[str], location: str = "", remote: bool = True, limit: int = 20) -> List[JobPosting]:
        """Mock Glassdoor scraping"""
        await asyncio.sleep(0.1)  # Simulate network delay
        return self._create_mock_jobs("Glassdoor", skills, limit)
    
    def _create_mock_jobs(self, source: str, skills: List[str], limit: int) -> List[JobPosting]:
        """Generate mock job data"""
        job_titles = [
            "Software Engineer", "Full Stack Developer", "Frontend Developer", "Backend Developer",
            "DevOps Engineer", "Data Scientist", "Product Manager", "UI/UX Designer",
            "Mobile Developer", "QA Engineer", "System Administrator", "Cloud Engineer"
        ]
        
        companies = [
            "TechCorp", "InnovateSoft", "Digital Solutions", "Future Systems",
            "CloudTech", "DataFlow", "WebWorks", "MobileFirst", "AI Solutions",
            "StartupXYZ", "Enterprise Inc", "Global Tech"
        ]
        
        locations = [
            "San Francisco, CA", "New York, NY", "Austin, TX", "Seattle, WA",
            "Boston, MA", "Denver, CO", "Chicago, IL", "Los Angeles, CA",
            "Remote", "Hybrid", "On-site"
        ]
        
        job_types = ["Full-time", "Part-time", "Contract", "Internship"]
        experience_levels = ["Entry", "Mid-level", "Senior", "Lead", "Principal"]
        
        jobs = []
        for i in range(limit):
            # Select random skills for this job
            job_skills = random.sample(skills, min(len(skills), random.randint(2, 5)))
            
            # Add some additional common skills
            common_skills = ["Git", "Agile", "Communication", "Problem Solving"]
            job_skills.extend(random.sample(common_skills, random.randint(1, 2)))
            
            # Calculate match score based on skill overlap
            match_score = self.calculate_match_score(job_skills, skills)
            
            job = JobPosting(
                id=f"{source.lower()}_{i}_{random.randint(1000, 9999)}",
                title=random.choice(job_titles),
                company=random.choice(companies),
                location=random.choice(locations),
                description=f"Exciting opportunity for a {random.choice(job_titles)} position. We're looking for someone passionate about technology and innovation.",
                requirements=job_skills[:3],  # First 3 skills as requirements
                skills=job_skills,
                salary_range=f"${random.randint(60, 150)}k - ${random.randint(80, 200)}k",
                job_type=random.choice(job_types),
                experience_level=random.choice(experience_levels),
                posted_date=datetime.now() - timedelta(days=random.randint(0, 30)),
                application_url=f"https://{source.lower()}.com/jobs/{random.randint(10000, 99999)}",
                source=source,
                remote=random.choice([True, False]),
                match_score=match_score
            )
            jobs.append(job)
        
        return jobs
    
    def _deduplicate_jobs(self, jobs: List[JobPosting]) -> List[JobPosting]:
        """Remove duplicate jobs based on title and company"""
        seen = set()
        unique_jobs = []
        
        for job in jobs:
            key = (job.title.lower(), job.company.lower())
            if key not in seen:
                seen.add(key)
                unique_jobs.append(job)
        
        return unique_jobs
    
    def calculate_match_score(self, job_skills: List[str], resume_skills: List[str]) -> float:
        """Calculate how well a job matches the resume skills"""
        if not resume_skills:
            return 0.0
        
        # Convert to lowercase for comparison
        job_skills_lower = [skill.lower() for skill in job_skills]
        resume_skills_lower = [skill.lower() for skill in resume_skills]
        
        # Find matching skills
        matches = sum(1 for skill in resume_skills_lower if skill in job_skills_lower)
        
        # Calculate score as percentage of resume skills that match
        score = (matches / len(resume_skills_lower)) * 100
        
        # Add bonus for having many relevant skills
        if len(job_skills) > len(resume_skills):
            score += min(10, (len(job_skills) - len(resume_skills)) * 2)
        
        return min(100, max(0, score))
    
    async def search_jobs_by_skills(self, skills: List[str], filters: Dict[str, Any] = None) -> List[JobPosting]:
        """Search jobs by skills with optional filters"""
        if not filters:
            filters = {}
        
        # Get base results
        jobs = await self.scrape_jobs(skills, limit=filters.get('limit', 50))
        
        # Apply filters
        if filters.get('min_salary'):
            jobs = self._filter_by_salary(jobs, filters['min_salary'], filters.get('max_salary'))
        
        if filters.get('job_type'):
            jobs = [job for job in jobs if job.job_type.lower() == filters['job_type'].lower()]
        
        if filters.get('experience_level'):
            jobs = [job for job in jobs if job.experience_level.lower() == filters['experience_level'].lower()]
        
        if filters.get('remote') is not None:
            jobs = [job for job in jobs if job.remote == filters['remote']]
        
        # Sort by match score
        jobs.sort(key=lambda x: x.match_score or 0, reverse=True)
        
        return jobs
    
    def _filter_by_salary(self, jobs: List[JobPosting], min_salary: Optional[int], max_salary: Optional[int]) -> List[JobPosting]:
        """Filter jobs by salary range"""
        def extract_salary(salary_str: str) -> int:
            try:
                # Extract first number from salary string
                import re
                numbers = re.findall(r'\d+', salary_str)
                return int(numbers[0]) if numbers else 0
            except:
                return 0
        
        filtered_jobs = []
        for job in jobs:
            if not job.salary_range:
                continue
            
            job_salary = extract_salary(job.salary_range)
            if min_salary and job_salary < min_salary:
                continue
            if max_salary and job_salary > max_salary:
                continue
            filtered_jobs.append(job)
        
        return filtered_jobs

# Global instance
job_scraper_service = JobScraperService()
