"""
Template management routes for the Resume Builder API.
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
import logging

from schemas.responses import SuccessResponse
from database import User
from routes.auth import get_current_user
from utils.rate_limiter import rate_limit_user
from utils.redis_cache import cache
from templates_service import template_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/templates", tags=["templates"])

@router.get("", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_all_templates():
    """Get all available templates with metadata."""
    try:
        templates = await template_service.get_all_templates_metadata()
        return {
            "templates": templates,
            "total_count": len(templates)
        }
    except Exception as e:
        logger.error(f"Error fetching templates: {e}")
        raise HTTPException(status_code=500, detail="Error fetching templates")

@router.get("/category/{category}", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_templates_by_category(category: str):
    """Get templates filtered by category."""
    try:
        templates = await template_service.get_templates_by_category(category)
        return {
            "templates": templates,
            "category": category,
            "total_count": len(templates)
        }
    except Exception as e:
        logger.error(f"Error fetching templates for category {category}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching templates")

@router.get("/profession/{profession}", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_templates_by_profession(profession: str):
    """Get templates recommended for a specific profession."""
    try:
        templates = await template_service.get_templates_by_profession(profession)
        return {
            "templates": templates,
            "profession": profession,
            "total_count": len(templates)
        }
    except Exception as e:
        logger.error(f"Error fetching templates for profession {profession}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching templates")

@router.get("/{template_id}", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_template_content(template_id: str):
    """Get detailed template content and configuration."""
    try:
        template_content = await template_service.get_template_content(template_id)
        if not template_content:
            raise HTTPException(status_code=404, detail="Template not found")
        
        template_metadata = template_service.templates_metadata.get(template_id, {})
        sample_content = await template_service.get_sample_content(template_id)
        
        return {
            "id": template_id,
            "metadata": template_metadata,
            "content": template_content,
            "sample_content": sample_content
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching template {template_id}: {e}")
        raise HTTPException(status_code=500, detail="Error fetching template")

@router.get("/search", dependencies=[Depends(rate_limit_user(300, 60))])
async def search_templates(query: str = Query(..., min_length=2)):
    """Search templates by name, description, or profession."""
    try:
        templates = await template_service.search_templates(query)
        return {
            "templates": templates,
            "query": query,
            "total_count": len(templates)
        }
    except Exception as e:
        logger.error(f"Error searching templates with query '{query}': {e}")
        raise HTTPException(status_code=500, detail="Error searching templates")

@router.get("/categories/list", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_template_categories():
    """Get all available template categories."""
    try:
        categories = set()
        for template in template_service.templates_metadata.values():
            categories.add(template["category"])
        
        return {
            "categories": sorted(list(categories)),
            "total_count": len(categories)
        }
    except Exception as e:
        logger.error(f"Error fetching template categories: {e}")
        raise HTTPException(status_code=500, detail="Error fetching categories")

@router.get("/professions/list", dependencies=[Depends(rate_limit_user(300, 60))])
async def get_template_professions():
    """Get all professions covered by templates."""
    try:
        professions = set()
        for template in template_service.templates_metadata.values():
            professions.update(template["professions"])
        
        return {
            "professions": sorted(list(professions)),
            "total_count": len(professions)
        }
    except Exception as e:
        logger.error(f"Error fetching template professions: {e}")
        raise HTTPException(status_code=500, detail="Error fetching professions")

@router.post("/clear-cache", dependencies=[Depends(rate_limit_user(10, 60))])
async def clear_template_cache(current_user: User = Depends(get_current_user)):
    """Clear template cache (admin/debug endpoint)."""
    try:
        await cache.clear_pattern("templates:*")
        return SuccessResponse(message="Template cache cleared successfully")
    except Exception as e:
        logger.error(f"Error clearing template cache: {e}")
        raise HTTPException(status_code=500, detail="Error clearing cache")
