from database import User, Resume, ResumeVersion, PersonalInfo
from typing import Optional, List, Dict, Any
from datetime import datetime
from bson import ObjectId
import bcrypt
import logging

logger = logging.getLogger(__name__)

class UserService:
    """Service class for user-related database operations"""
    
    @staticmethod
    async def create_user(email: str, password: Optional[str], first_name: str = None, last_name: str = None) -> User:
        """Create a new user"""
        try:
            # Check if user already exists
            existing_user = await User.find_one(User.email == email)
            if existing_user:
                raise ValueError("User with this email already exists")
            
            hashed_password = None
            if password:
                # Hash password
                hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            user = User(
                email=email,
                first_name=first_name,
                last_name=last_name,
                hashed_password=hashed_password,
                is_active=True
            )
            
            await user.save()
            
            logger.info(f"Created new user: {email}")
            return user
            
        except Exception as e:
            logger.error(f"Error creating user {email}: {e}")
            raise
    
    @staticmethod
    async def get_user_by_email(email: str) -> Optional[User]:
        """Get user by email address"""
        return await User.find_one(User.email == email)
    
    @staticmethod
    async def get_user_by_id(user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            return await User.get(user_id)
        except Exception:
            return None
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    @staticmethod
    async def update_user_password(user_id: str, new_password: str) -> bool:
        """Update user password"""
        try:
            user = await User.get(user_id)
            if not user:
                return False
            
            # Hash new password
            hashed_password = bcrypt.hashpw(new_password.encode('utf-8'), bcrypt.gensalt())
            user.hashed_password = hashed_password.decode('utf-8')
            user.updated_at = datetime.utcnow()
            
            await user.save()
            logger.info(f"Updated password for user ID: {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error updating password for user {user_id}: {e}")
            return False

class ResumeService:
    """Service class for resume-related database operations"""
    
    @staticmethod
    async def create_resume(
        user_id: str, 
        title: str = "My Resume",
        resume_data: Dict[str, Any] = None
    ) -> Resume:
        """Create a new resume for a user"""
        try:
            if resume_data is None:
                resume_data = {}
            
            # Convert personal_info dict to PersonalInfo object if needed
            personal_info_data = resume_data.get('personal_info', {})
            if isinstance(personal_info_data, dict):
                personal_info = PersonalInfo(**personal_info_data)
            else:
                personal_info = personal_info_data
            
            resume = Resume(
                user_id=user_id,
                title=title,
                personal_info=personal_info,
                professional_summary=resume_data.get('professional_summary', ''),
                skills=resume_data.get('skills', []),
                experience=resume_data.get('experience', []),
                education=resume_data.get('education', []),
                projects=resume_data.get('projects', []),
                certifications=resume_data.get('certifications', []),
                template_id=resume_data.get('template_id', 'basic'),
                font_family=resume_data.get('font_family', 'font-sans'),
                accent_color=resume_data.get('accent_color', '#2563eb')
            )
            
            await resume.save()
            
            # Create initial version
            await ResumeService.create_resume_version(str(resume.id), user_id)
            
            logger.info(f"Created new resume for user {user_id}: {title}")
            return resume
            
        except Exception as e:
            logger.error(f"Error creating resume for user {user_id}: {e}")
            raise
    
    @staticmethod
    async def get_user_resumes(user_id: str, limit: int = 50, offset: int = 0) -> List[Resume]:
        """Get paginated resumes for a user"""
        return await Resume.find(
            Resume.user_id == user_id
        ).sort(-Resume.updated_at).skip(offset).limit(limit).to_list()
    
    @staticmethod
    async def get_resume_by_id(resume_id: str, user_id: str = None) -> Optional[Resume]:
        """Get resume by ID, optionally filtered by user"""
        try:
            if user_id:
                # Use compound query for better performance
                resume = await Resume.find_one(
                    Resume.id == ObjectId(resume_id),
                    Resume.user_id == user_id
                )
            else:
                resume = await Resume.get(resume_id)
            return resume
        except Exception:
            return None
    
    @staticmethod
    async def update_resume(
        resume_id: str, 
        user_id: str, 
        updates: Dict[str, Any],
        create_version: bool = True
    ) -> Optional[Resume]:
        """Update an existing resume"""
        try:
            resume = await Resume.find_one(
                Resume.id == ObjectId(resume_id),
                Resume.user_id == user_id
            )
            
            if not resume:
                return None
            
            # Create version before updating if requested
            if create_version:
                await ResumeService.create_resume_version(resume_id, user_id)
            
            # Update fields
            for field, value in updates.items():
                if hasattr(resume, field):
                    # Handle PersonalInfo separately
                    if field == 'personal_info' and isinstance(value, dict):
                        resume.personal_info = PersonalInfo(**value)
                    else:
                        setattr(resume, field, value)
            
            resume.updated_at = datetime.utcnow()
            await resume.save()
            
            logger.info(f"Updated resume {resume_id} for user {user_id}")
            return resume
            
        except Exception as e:
            logger.error(f"Error updating resume {resume_id}: {e}")
            raise
    
    @staticmethod
    async def delete_resume(resume_id: str, user_id: str) -> bool:
        """Delete a resume"""
        try:
            resume = await Resume.find_one(
                Resume.id == ObjectId(resume_id),
                Resume.user_id == user_id
            )
            
            if not resume:
                return False
            
            await resume.delete()
            
            # Also delete all versions
            await ResumeVersion.find(
                ResumeVersion.resume_id == resume_id
            ).delete()
            
            logger.info(f"Deleted resume {resume_id} for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting resume {resume_id}: {e}")
            return False
    
    @staticmethod
    async def get_user_default_resume(user_id: str) -> Optional[Resume]:
        """Get user's default resume"""
        return await Resume.find_one(
            Resume.user_id == user_id,
            Resume.is_default == True
        )
    
    @staticmethod
    async def set_default_resume(resume_id: str, user_id: str) -> bool:
        """Set a resume as the user's default"""
        try:
            # Remove default flag from all user resumes
            await Resume.find(Resume.user_id == user_id).update({"$set": {"is_default": False}})
            
            # Set new default
            resume = await Resume.find_one(
                Resume.id == ObjectId(resume_id),
                Resume.user_id == user_id
            )
            
            if not resume:
                return False
            
            resume.is_default = True
            await resume.save()
            
            logger.info(f"Set resume {resume_id} as default for user {user_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error setting default resume {resume_id}: {e}")
            return False
    
    @staticmethod
    async def create_resume_version(resume_id: str, user_id: str) -> Optional[ResumeVersion]:
        """Create a version snapshot of a resume"""
        try:
            resume = await ResumeService.get_resume_by_id(resume_id, user_id)
            if not resume:
                return None
            
            # Get latest version number
            latest_version = await ResumeVersion.find(
                ResumeVersion.resume_id == resume_id
            ).sort(-ResumeVersion.version_number).first_or_none()
            
            version_number = (latest_version.version_number + 1) if latest_version else 1
            
            version = ResumeVersion(
                resume_id=resume_id,
                user_id=user_id,
                version_number=version_number,
                title=resume.title,
                personal_info=resume.personal_info,
                professional_summary=resume.professional_summary,
                skills=resume.skills,
                experience=resume.experience,
                education=resume.education,
                projects=resume.projects,
                certifications=resume.certifications,
                template_id=resume.template_id,
                font_family=resume.font_family,
                accent_color=resume.accent_color
            )
            
            await version.save()
            
            logger.info(f"Created version {version_number} for resume {resume_id}")
            return version
            
        except Exception as e:
            logger.error(f"Error creating resume version: {e}")
            return None
    
    @staticmethod
    async def get_resume_versions(resume_id: str, user_id: str) -> List[ResumeVersion]:
        """Get all versions of a resume"""
        return await ResumeVersion.find(
            ResumeVersion.resume_id == resume_id,
            ResumeVersion.user_id == user_id
        ).sort(-ResumeVersion.version_number).to_list()
    
    @staticmethod
    async def restore_resume_version(resume_id: str, version_id: str, user_id: str) -> bool:
        """Restore a resume to a specific version"""
        try:
            # Get the version to restore
            version = await ResumeVersion.find_one(
                ResumeVersion.id == ObjectId(version_id),
                ResumeVersion.resume_id == resume_id,
                ResumeVersion.user_id == user_id
            )
            
            if not version:
                return False
            
            # Get the resume
            resume = await ResumeService.get_resume_by_id(resume_id, user_id)
            if not resume:
                return False
            
            # Create a backup version before restoring
            await ResumeService.create_resume_version(resume_id, user_id)
            
            # Restore data from version
            resume.title = version.title
            resume.personal_info = version.personal_info
            resume.professional_summary = version.professional_summary
            resume.skills = version.skills
            resume.experience = version.experience
            resume.education = version.education
            resume.projects = version.projects
            resume.certifications = version.certifications
            resume.template_id = version.template_id
            resume.font_family = version.font_family
            resume.accent_color = version.accent_color
            resume.updated_at = datetime.utcnow()
            
            await resume.save()
            
            logger.info(f"Restored resume {resume_id} to version {version.version_number}")
            return True
            
        except Exception as e:
            logger.error(f"Error restoring resume version: {e}")
            return False

    @staticmethod
    async def get_user_resume_count(user_id: str) -> int:
        """Get total count of resumes for a user"""
        try:
            return await Resume.find(Resume.user_id == user_id).count()
        except Exception as e:
            logger.error(f"Error getting resume count for user {user_id}: {e}")
            return 0

    @staticmethod
    async def get_resume_stats(user_id: str) -> Dict[str, Any]:
        """Get resume statistics for a user"""
        try:
            total_resumes = await ResumeService.get_user_resume_count(user_id)
            
            # Get most recent resume
            recent_resume = await Resume.find(
                Resume.user_id == user_id
            ).sort(-Resume.updated_at).first_or_none()
            
            # Get default resume separately for efficiency
            default_resume = await Resume.find_one(
                Resume.user_id == user_id,
                Resume.is_default == True
            )
            
            stats = {
                "total_resumes": total_resumes,
                "last_updated": recent_resume.updated_at if recent_resume else None,
                "default_resume_id": str(default_resume.id) if default_resume else None
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting resume stats for user {user_id}: {e}")
            return {"total_resumes": 0, "last_updated": None, "default_resume_id": None}