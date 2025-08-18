"""
Resume management routes for the Resume Builder API.
"""
from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
import logging

from schemas.requests import ResumeUpdateRequest, ResumeScoreRequest
from models import OptimizeResumeRequest, GenerateResumeRequest, ParseResumeRequest, GenerateCoverLetterRequest
from schemas.responses import ResumeResponse, ResumeListResponse, ResumeListItem, ResumeVersionResponse, SuccessResponse
from database import User
from db_service import ResumeService
from routes.auth import get_current_user
from gemini_service import gemini_service
from openai_service import openai_service
from file_parser import file_parser

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/resumes", tags=["resumes"])

@router.post("", response_model=ResumeListItem)
async def create_resume(
    title: str = "My Resume",
    current_user: User = Depends(get_current_user)
):
    """Create a new resume for the current user."""
    try:
        resume = await ResumeService.create_resume(
            user_id=str(current_user.id),
            title=title
        )
        return ResumeListItem(
            id=str(resume.id),
            title=resume.title,
            is_default=resume.is_default,
            template_id=resume.template_id,
            created_at=resume.created_at,
            updated_at=resume.updated_at
        )
    except Exception as e:
        logger.error(f"Error creating resume for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error creating resume")

@router.get("", response_model=ResumeListResponse)
async def get_user_resumes(
    limit: int = 50, 
    offset: int = 0,
    current_user: User = Depends(get_current_user)
):
    """Get paginated resumes for the current user."""
    try:
        resumes = await ResumeService.get_user_resumes(str(current_user.id), limit, offset)
        total_count = await ResumeService.get_user_resume_count(str(current_user.id))
        
        resume_items = [
            ResumeListItem(
                id=str(resume.id),
                title=resume.title,
                is_default=resume.is_default,
                template_id=resume.template_id,
                created_at=resume.created_at,
                updated_at=resume.updated_at
            )
            for resume in resumes
        ]
        
        return ResumeListResponse(
            resumes=resume_items,
            total_count=total_count
        )
    except Exception as e:
        logger.error(f"Error fetching resumes for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resumes")

@router.get("/my-resume", response_model=ResumeResponse)
async def get_my_resume(
    current_user: User = Depends(get_current_user)
):
    """Get the authenticated user's most recently updated resume."""
    try:
        resumes = await ResumeService.get_user_resumes(str(current_user.id), limit=1)
        if not resumes:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        resume = resumes[0]
        return ResumeResponse(
            id=str(resume.id),
            title=resume.title,
            is_default=resume.is_default,
            personal_info=resume.personal_info.dict(),
            professional_summary=resume.professional_summary,
            skills=resume.skills,
            experience=[exp.dict() for exp in resume.experience],
            education=[edu.dict() for edu in resume.education],
            projects=[proj.dict() for proj in resume.projects],
            certifications=[cert.dict() for cert in resume.certifications],
            template_id=resume.template_id,
            font_family=resume.font_family,
            accent_color=resume.accent_color,
            created_at=resume.created_at,
            updated_at=resume.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resume for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume")

@router.get("/{resume_id}", response_model=ResumeResponse)
async def get_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get a specific resume by ID."""
    try:
        resume = await ResumeService.get_resume_by_id(resume_id, str(current_user.id))
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return ResumeResponse(
            id=str(resume.id),
            title=resume.title,
            is_default=resume.is_default,
            personal_info=resume.personal_info.dict(),
            professional_summary=resume.professional_summary,
            skills=resume.skills,
            experience=[exp.dict() for exp in resume.experience],
            education=[edu.dict() for edu in resume.education],
            projects=[proj.dict() for proj in resume.projects],
            certifications=[cert.dict() for cert in resume.certifications],
            template_id=resume.template_id,
            font_family=resume.font_family,
            accent_color=resume.accent_color,
            created_at=resume.created_at,
            updated_at=resume.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume")

@router.put("/my-resume", response_model=ResumeResponse)
async def update_my_resume(
    resume_data: dict,
    current_user: User = Depends(get_current_user)
):
    """Update the user's most recent resume."""
    try:
        resumes = await ResumeService.get_user_resumes(str(current_user.id), limit=1)
        if not resumes:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        resume = resumes[0]
        updated_resume = await ResumeService.update_resume(
            resume_id=str(resume.id),
            user_id=str(current_user.id),
            updates=resume_data
        )
        
        return ResumeResponse(
            id=str(updated_resume.id),
            title=updated_resume.title,
            is_default=updated_resume.is_default,
            personal_info=updated_resume.personal_info.dict(),
            professional_summary=updated_resume.professional_summary,
            skills=updated_resume.skills,
            experience=[exp.dict() for exp in updated_resume.experience],
            education=[edu.dict() for edu in updated_resume.education],
            projects=[proj.dict() for proj in updated_resume.projects],
            certifications=[cert.dict() for cert in updated_resume.certifications],
            template_id=updated_resume.template_id,
            font_family=updated_resume.font_family,
            accent_color=updated_resume.accent_color,
            created_at=updated_resume.created_at,
            updated_at=updated_resume.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resume for user {current_user.id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating resume")

@router.put("/{resume_id}", response_model=SuccessResponse)
async def update_resume(
    resume_id: str,
    updates: dict,
    current_user: User = Depends(get_current_user)
):
    """Update a resume."""
    try:
        resume = await ResumeService.update_resume(
            resume_id=resume_id,
            user_id=str(current_user.id),
            updates=updates
        )
        if not resume:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return SuccessResponse(
            message="Resume updated successfully",
            data={"updated_at": resume.updated_at}
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error updating resume")

@router.delete("/{resume_id}", response_model=SuccessResponse)
async def delete_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete a resume."""
    try:
        success = await ResumeService.delete_resume(resume_id, str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return SuccessResponse(message="Resume deleted successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error deleting resume")

@router.post("/{resume_id}/set-default", response_model=SuccessResponse)
async def set_default_resume(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Set a resume as the user's default."""
    try:
        success = await ResumeService.set_default_resume(resume_id, str(current_user.id))
        if not success:
            raise HTTPException(status_code=404, detail="Resume not found")
        
        return SuccessResponse(message="Default resume set successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error setting default resume {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error setting default resume")

@router.get("/{resume_id}/versions", response_model=List[ResumeVersionResponse])
async def get_resume_versions(
    resume_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get all versions of a resume."""
    try:
        versions = await ResumeService.get_resume_versions(resume_id, str(current_user.id))
        return [
            ResumeVersionResponse(
                id=str(version.id),
                version_number=version.version_number,
                title=version.title,
                created_at=version.created_at
            )
            for version in versions
        ]
    except Exception as e:
        logger.error(f"Error fetching resume versions for {resume_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching resume versions")

@router.post("/{resume_id}/versions/{version_id}/restore", response_model=SuccessResponse)
async def restore_resume_version(
    resume_id: str,
    version_id: str,
    current_user: User = Depends(get_current_user)
):
    """Restore a resume to a specific version."""
    try:
        success = await ResumeService.restore_resume_version(
            resume_id, version_id, str(current_user.id)
        )
        if not success:
            raise HTTPException(status_code=404, detail="Resume or version not found")
        
        return SuccessResponse(message="Resume restored successfully")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error restoring resume version {version_id}: {e}")
        raise HTTPException(status_code=500, detail="Error restoring resume version")

# AI-powered routes
ai_router = APIRouter(prefix="/ai", tags=["ai"])

@ai_router.post("/parse-and-save-resume", response_model=ResumeResponse)
async def parse_and_save_resume(
    file: UploadFile = File(...), 
    current_user: User = Depends(get_current_user)
):
    """Parse, and save the uploaded resume file using AI."""
    # Ensure current_user is not None (authentication check)
    if not current_user or not getattr(current_user, "id", None):
        raise HTTPException(status_code=401, detail="Not authenticated")

    try:
        file_content = await file.read()
        resume_text = file_parser.parse_file(file.filename, file_content)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="Failed to parse the uploaded file")
        
        pre_processed_data = file_parser.pre_process_resume(resume_text)
        structured_resume = await gemini_service.parse_resume(
            resume_text,
            pre_processed_hints=pre_processed_data
        )
        
        resume = await ResumeService.create_resume(
            user_id=str(current_user.id),
            title=f"Resume from {file.filename}",
            resume_data=structured_resume
        )
        
        return ResumeResponse(
            id=str(resume.id),
            title=resume.title,
            is_default=resume.is_default,
            personal_info=resume.personal_info.dict(),
            professional_summary=resume.professional_summary,
            skills=resume.skills,
            experience=[exp.dict() for exp in resume.experience],
            education=[edu.dict() for edu in resume.education],
            projects=[proj.dict() for proj in resume.projects],
            certifications=[cert.dict() for cert in resume.certifications],
            template_id=resume.template_id,
            font_family=resume.font_family,
            accent_color=resume.accent_color,
            created_at=resume.created_at,
            updated_at=resume.updated_at
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error parsing resume file {file.filename}: {e}")
        raise HTTPException(status_code=500, detail="Error parsing resume")


@ai_router.post("/optimize-resume")
async def optimize_resume(request: OptimizeResumeRequest):
    """Optimize resume for specific job description using AI."""
    try:
        optimized_resume = await openai_service.optimize_resume_for_job(
            request.resume, request.job_description
        )
        return optimized_resume
    except Exception as e:
        logger.error(f"Error optimizing resume: {e}")
        raise HTTPException(status_code=500, detail="Error optimizing resume")

@ai_router.post("/generate-resume")
async def generate_resume(request: GenerateResumeRequest):
    """Generate resume from job description and user background using AI."""
    try:
        generated_resume = await openai_service.generate_resume_from_job(
            request.job_description, request.user_background
        )
        return generated_resume
    except Exception as e:
        logger.error(f"Error generating resume: {e}")
        raise HTTPException(status_code=500, detail="Error generating resume")

@ai_router.post("/generate-cover-letter")
async def generate_cover_letter(request: GenerateCoverLetterRequest):
    """Generate a cover letter based on resume and job description."""
    try:
        cover_letter = await openai_service.generate_cover_letter(
            request.resume, request.job_description
        )
        return {"cover_letter": cover_letter}
    except Exception as e:
        logger.error(f"Error generating cover letter: {e}")
        raise HTTPException(status_code=500, detail="Error generating cover letter")

@router.post("/score", response_model=dict)
async def score_resume(
    request: ResumeScoreRequest,
    current_user: User = Depends(get_current_user)
):
    """Score a resume and provide feedback using AI."""
    try:
        # Convert dict to Resume model for the service
        from models import Resume
        try:
            resume_model = Resume(**request.resume)
        except Exception as validation_error:
            logger.error(f"Resume validation error: {validation_error}")
            raise HTTPException(status_code=400, detail=f"Invalid resume data: {str(validation_error)}")
        
        # Use OpenAI service to analyze the resume
        score_result = await openai_service.score_resume(
            resume=resume_model,
            job_description=request.job_description
        )
        return score_result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scoring resume: {e}")
        raise HTTPException(status_code=500, detail="Error scoring resume")

# Include AI router in main resume router
router.include_router(ai_router)
