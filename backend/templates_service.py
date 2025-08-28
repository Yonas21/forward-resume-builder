"""
Templates service for managing professional resume templates.
"""
import json
import logging
from typing import Dict, List, Optional, Any
from pathlib import Path

from core.config import settings
from utils.redis_cache import cache, cache_result

logger = logging.getLogger(__name__)

class TemplateService:
    """Service for managing resume templates with lazy loading."""
    
    def __init__(self):
        self.templates_cache = {}
        self.templates_metadata = {}
        self._load_templates_metadata()
    
    def _serialize_template_dict(self, template: Dict[str, Any]) -> Dict[str, Any]:
        """Ensure template dictionary is JSON serializable."""
        return {
            'id': str(template['id']),
            'name': str(template['name']),
            'description': str(template['description']),
            'professions': [str(prof) for prof in template['professions']],
            'sections': [str(section) for section in template['sections']],
            'preview_image': str(template['preview_image']),
            'category': str(template['category'])
        }

    def _load_templates_metadata(self):
        """Load templates metadata for lazy loading."""
        self.templates_metadata = {
            "software_engineer": {
                "id": "software_engineer",
                "name": "Software Engineer",
                "description": "Modern, clean template optimized for tech professionals",
                "professions": ["Software Engineer", "Developer", "Programmer", "Full Stack Developer"],
                "sections": ["personal", "summary", "experience", "education", "skills", "projects"],
                "preview_image": "/templates/software-engineer-preview.png",
                "category": "technology"
            },
            "data_scientist": {
                "id": "data_scientist", 
                "name": "Data Scientist",
                "description": "Professional template highlighting analytical skills and projects",
                "professions": ["Data Scientist", "Data Analyst", "Machine Learning Engineer", "AI Engineer"],
                "sections": ["personal", "summary", "experience", "education", "skills", "projects", "publications"],
                "preview_image": "/templates/data-scientist-preview.png",
                "category": "technology"
            },
            "marketing_manager": {
                "id": "marketing_manager",
                "name": "Marketing Manager", 
                "description": "Creative template emphasizing leadership and campaign results",
                "professions": ["Marketing Manager", "Digital Marketing", "Brand Manager", "Marketing Director"],
                "sections": ["personal", "summary", "experience", "education", "skills", "achievements"],
                "preview_image": "/templates/marketing-manager-preview.png",
                "category": "business"
            },
            "financial_analyst": {
                "id": "financial_analyst",
                "name": "Financial Analyst",
                "description": "Conservative template focusing on quantitative achievements",
                "professions": ["Financial Analyst", "Investment Analyst", "Accountant", "Finance Manager"],
                "sections": ["personal", "summary", "experience", "education", "skills", "certifications"],
                "preview_image": "/templates/financial-analyst-preview.png",
                "category": "finance"
            },
            "healthcare_professional": {
                "id": "healthcare_professional",
                "name": "Healthcare Professional",
                "description": "Professional template for medical and healthcare roles",
                "professions": ["Doctor", "Nurse", "Healthcare Administrator", "Medical Researcher"],
                "sections": ["personal", "summary", "experience", "education", "skills", "certifications"],
                "preview_image": "/templates/healthcare-preview.png",
                "category": "healthcare"
            },
            "designer": {
                "id": "designer",
                "name": "Creative Designer",
                "description": "Visual template showcasing creative portfolio and projects",
                "professions": ["UX Designer", "UI Designer", "Graphic Designer", "Product Designer"],
                "sections": ["personal", "summary", "experience", "education", "skills", "portfolio"],
                "preview_image": "/templates/designer-preview.png",
                "category": "creative"
            },
            "sales_professional": {
                "id": "sales_professional",
                "name": "Sales Professional",
                "description": "Results-driven template highlighting sales achievements",
                "professions": ["Sales Representative", "Account Executive", "Sales Manager", "Business Development"],
                "sections": ["personal", "summary", "experience", "education", "skills", "achievements"],
                "preview_image": "/templates/sales-preview.png",
                "category": "business"
            },
            "project_manager": {
                "id": "project_manager",
                "name": "Project Manager",
                "description": "Leadership-focused template emphasizing project delivery",
                "professions": ["Project Manager", "Program Manager", "Product Manager", "Scrum Master"],
                "sections": ["personal", "summary", "experience", "education", "skills", "certifications"],
                "preview_image": "/templates/project-manager-preview.png",
                "category": "management"
            }
        }
    
    @cache_result(ttl=3600, key_prefix="templates")
    async def get_all_templates_metadata(self) -> List[Dict[str, Any]]:
        """Get metadata for all available templates."""
        try:
            return [self._serialize_template_dict(template) for template in self.templates_metadata.values()]
        except Exception as e:
            logger.error(f"Error serializing templates metadata: {e}")
            return []
    
    @cache_result(ttl=3600, key_prefix="templates")
    async def get_templates_by_category(self, category: str) -> List[Dict[str, Any]]:
        """Get templates filtered by category."""
        try:
            return [
                self._serialize_template_dict(template) 
                for template in self.templates_metadata.values()
                if template["category"] == category
            ]
        except Exception as e:
            logger.error(f"Error serializing templates by category {category}: {e}")
            return []
    
    @cache_result(ttl=3600, key_prefix="templates")
    async def get_templates_by_profession(self, profession: str) -> List[Dict[str, Any]]:
        """Get templates recommended for a specific profession."""
        try:
            profession_lower = profession.lower()
            return [
                self._serialize_template_dict(template)
                for template in self.templates_metadata.values()
                if any(prof in profession_lower for prof in [p.lower() for p in template["professions"]])
            ]
        except Exception as e:
            logger.error(f"Error serializing templates by profession {profession}: {e}")
            return []
    
    async def get_template_content(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Lazy load template content when needed."""
        if template_id not in self.templates_metadata:
            return None
        
        # Check if template is already loaded in memory
        if template_id in self.templates_cache:
            return self.templates_cache[template_id]
        
        # Load template content
        template_content = await self._load_template_content(template_id)
        if template_content:
            self.templates_cache[template_id] = template_content
        
        return template_content
    
    async def _load_template_content(self, template_id: str) -> Optional[Dict[str, Any]]:
        """Load the actual template content and styling."""
        template_configs = {
            "software_engineer": {
                "layout": "modern",
                "font_family": "Inter",
                "accent_color": "#2563eb",
                "section_order": ["personal", "summary", "skills", "experience", "projects", "education"],
                "styling": {
                    "header_style": "gradient",
                    "section_spacing": "comfortable",
                    "bullet_style": "modern",
                    "emphasis": "bold"
                }
            },
            "data_scientist": {
                "layout": "academic",
                "font_family": "Roboto",
                "accent_color": "#7c3aed",
                "section_order": ["personal", "summary", "skills", "experience", "projects", "publications", "education"],
                "styling": {
                    "header_style": "minimal",
                    "section_spacing": "generous",
                    "bullet_style": "clean",
                    "emphasis": "italic"
                }
            },
            "marketing_manager": {
                "layout": "creative",
                "font_family": "Poppins",
                "accent_color": "#dc2626",
                "section_order": ["personal", "summary", "skills", "experience", "achievements", "education"],
                "styling": {
                    "header_style": "bold",
                    "section_spacing": "balanced",
                    "bullet_style": "highlighted",
                    "emphasis": "color"
                }
            },
            "financial_analyst": {
                "layout": "traditional",
                "font_family": "Times New Roman",
                "accent_color": "#059669",
                "section_order": ["personal", "summary", "skills", "experience", "education", "certifications"],
                "styling": {
                    "header_style": "classic",
                    "section_spacing": "compact",
                    "bullet_style": "traditional",
                    "emphasis": "underline"
                }
            },
            "healthcare_professional": {
                "layout": "professional",
                "font_family": "Arial",
                "accent_color": "#0891b2",
                "section_order": ["personal", "summary", "skills", "experience", "education", "certifications"],
                "styling": {
                    "header_style": "clean",
                    "section_spacing": "standard",
                    "bullet_style": "simple",
                    "emphasis": "bold"
                }
            },
            "designer": {
                "layout": "portfolio",
                "font_family": "Montserrat",
                "accent_color": "#f59e0b",
                "section_order": ["personal", "summary", "skills", "portfolio", "experience", "education"],
                "styling": {
                    "header_style": "creative",
                    "section_spacing": "spacious",
                    "bullet_style": "visual",
                    "emphasis": "creative"
                }
            },
            "sales_professional": {
                "layout": "results",
                "font_family": "Open Sans",
                "accent_color": "#be185d",
                "section_order": ["personal", "summary", "skills", "achievements", "experience", "education"],
                "styling": {
                    "header_style": "impact",
                    "section_spacing": "dynamic",
                    "bullet_style": "results",
                    "emphasis": "metrics"
                }
            },
            "project_manager": {
                "layout": "leadership",
                "font_family": "Segoe UI",
                "accent_color": "#1f2937",
                "section_order": ["personal", "summary", "skills", "experience", "certifications", "education"],
                "styling": {
                    "header_style": "authoritative",
                    "section_spacing": "structured",
                    "bullet_style": "organized",
                    "emphasis": "leadership"
                }
            }
        }
        
        return template_configs.get(template_id)
    
    async def get_sample_content(self, template_id: str) -> Dict[str, Any]:
        """Get sample content for a template."""
        sample_content = {
            "software_engineer": {
                "personal_info": {
                    "full_name": "Alex Johnson",
                    "email": "alex.johnson@email.com",
                    "phone": "(555) 123-4567",
                    "location": "San Francisco, CA",
                    "linkedin": "linkedin.com/in/alexjohnson",
                    "github": "github.com/alexjohnson"
                },
                "professional_summary": "Full-stack software engineer with 5+ years of experience building scalable web applications. Proficient in React, Node.js, and Python with a focus on cloud-native development and microservices architecture.",
                "skills": [
                    {"name": "JavaScript", "category_id": "programming", "category": "Programming Languages", "level": "expert"},
                    {"name": "React", "category_id": "frameworks", "category": "Frameworks & Libraries", "level": "expert"},
                    {"name": "Node.js", "category_id": "frameworks", "category": "Frameworks & Libraries", "level": "advanced"},
                    {"name": "Python", "category_id": "programming", "category": "Programming Languages", "level": "advanced"},
                    {"name": "AWS", "category_id": "cloud", "category": "Cloud & DevOps", "level": "intermediate"}
                ]
            },
            "data_scientist": {
                "personal_info": {
                    "full_name": "Dr. Sarah Chen",
                    "email": "sarah.chen@email.com",
                    "phone": "(555) 987-6543",
                    "location": "New York, NY",
                    "linkedin": "linkedin.com/in/sarahchen",
                    "github": "github.com/sarahchen"
                },
                "professional_summary": "Data scientist with expertise in machine learning, statistical analysis, and big data processing. Published researcher with experience in predictive modeling and data-driven decision making.",
                "skills": [
                    {"name": "Python", "category_id": "programming", "category": "Programming Languages", "level": "expert"},
                    {"name": "TensorFlow", "category_id": "machine_learning", "category": "Machine Learning", "level": "expert"},
                    {"name": "SQL", "category_id": "databases", "category": "Databases & Storage", "level": "advanced"},
                    {"name": "R", "category_id": "programming", "category": "Programming Languages", "level": "advanced"},
                    {"name": "Tableau", "category_id": "data_analysis", "category": "Data Analysis", "level": "intermediate"}
                ]
            },
            "marketing_manager": {
                "personal_info": {
                    "full_name": "Emily Rodriguez",
                    "email": "emily.rodriguez@email.com",
                    "phone": "(555) 456-7890",
                    "location": "Los Angeles, CA",
                    "linkedin": "linkedin.com/in/emilyrodriguez"
                },
                "professional_summary": "Strategic marketing professional with expertise in digital marketing, brand management, and campaign optimization.",
                "skills": [
                    {"name": "Digital Marketing", "category_id": "marketing", "category": "Marketing & Sales", "level": "expert"},
                    {"name": "Google Analytics", "category_id": "data_analysis", "category": "Data Analysis", "level": "expert"},
                    {"name": "Social Media Marketing", "category_id": "marketing", "category": "Marketing & Sales", "level": "advanced"},
                    {"name": "Content Strategy", "category_id": "marketing", "category": "Marketing & Sales", "level": "advanced"},
                    {"name": "Brand Management", "category_id": "marketing", "category": "Marketing & Sales", "level": "intermediate"}
                ]
            },
            "financial_analyst": {
                "personal_info": {
                    "full_name": "Michael Chen",
                    "email": "michael.chen@email.com",
                    "phone": "(555) 789-0123",
                    "location": "Chicago, IL",
                    "linkedin": "linkedin.com/in/michaelchen"
                },
                "professional_summary": "Financial analyst with strong quantitative skills and experience in financial modeling and data analysis.",
                "skills": [
                    {"name": "Financial Modeling", "category_id": "finance", "category": "Finance & Accounting", "level": "expert"},
                    {"name": "Excel", "category_id": "tools", "category": "Tools & Platforms", "level": "expert"},
                    {"name": "SQL", "category_id": "databases", "category": "Databases & Storage", "level": "advanced"},
                    {"name": "Risk Analysis", "category_id": "finance", "category": "Finance & Accounting", "level": "advanced"},
                    {"name": "Bloomberg Terminal", "category_id": "tools", "category": "Tools & Platforms", "level": "intermediate"}
                ]
            },
            "healthcare_professional": {
                "personal_info": {
                    "full_name": "Dr. Jennifer Smith",
                    "email": "jennifer.smith@email.com",
                    "phone": "(555) 321-6540",
                    "location": "Boston, MA",
                    "linkedin": "linkedin.com/in/jennifersmith"
                },
                "professional_summary": "Healthcare professional with extensive clinical experience and expertise in patient care and medical procedures.",
                "skills": [
                    {"name": "Patient Care", "category_id": "healthcare", "category": "Healthcare", "level": "expert"},
                    {"name": "Medical Procedures", "category_id": "healthcare", "category": "Healthcare", "level": "expert"},
                    {"name": "Electronic Health Records", "category_id": "tools", "category": "Tools & Platforms", "level": "advanced"},
                    {"name": "Medical Documentation", "category_id": "healthcare", "category": "Healthcare", "level": "advanced"},
                    {"name": "Healthcare Regulations", "category_id": "healthcare", "category": "Healthcare", "level": "intermediate"}
                ]
            },
            "designer": {
                "personal_info": {
                    "full_name": "Alex Kim",
                    "email": "alex.kim@email.com",
                    "phone": "(555) 654-3210",
                    "location": "Seattle, WA",
                    "linkedin": "linkedin.com/in/alexkim"
                },
                "professional_summary": "Creative designer with expertise in user experience design, visual design, and design systems.",
                "skills": [
                    {"name": "UI/UX Design", "category_id": "ui_ux", "category": "UI/UX Design", "level": "expert"},
                    {"name": "Figma", "category_id": "design", "category": "Design & Creative", "level": "expert"},
                    {"name": "Adobe Creative Suite", "category_id": "design", "category": "Design & Creative", "level": "advanced"},
                    {"name": "Prototyping", "category_id": "ui_ux", "category": "UI/UX Design", "level": "advanced"},
                    {"name": "Design Systems", "category_id": "ui_ux", "category": "UI/UX Design", "level": "intermediate"}
                ]
            },
            "sales_professional": {
                "personal_info": {
                    "full_name": "Sarah Johnson",
                    "email": "sarah.johnson@email.com",
                    "phone": "(555) 987-6543",
                    "location": "Dallas, TX",
                    "linkedin": "linkedin.com/in/sarahjohnson"
                },
                "professional_summary": "Results-driven sales professional with proven track record in B2B sales and relationship management.",
                "skills": [
                    {"name": "B2B Sales", "category_id": "marketing", "category": "Marketing & Sales", "level": "expert"},
                    {"name": "CRM Systems", "category_id": "tools", "category": "Tools & Platforms", "level": "expert"},
                    {"name": "Negotiation", "category_id": "communication", "category": "Communication", "level": "advanced"},
                    {"name": "Lead Generation", "category_id": "marketing", "category": "Marketing & Sales", "level": "advanced"},
                    {"name": "Sales Analytics", "category_id": "data_analysis", "category": "Data Analysis", "level": "intermediate"}
                ]
            },
            "project_manager": {
                "personal_info": {
                    "full_name": "David Wilson",
                    "email": "david.wilson@email.com",
                    "phone": "(555) 123-7890",
                    "location": "Atlanta, GA",
                    "linkedin": "linkedin.com/in/davidwilson"
                },
                "professional_summary": "Experienced project manager with expertise in agile methodologies and cross-functional team leadership.",
                "skills": [
                    {"name": "Project Management", "category_id": "project_management", "category": "Project Management", "level": "expert"},
                    {"name": "Agile/Scrum", "category_id": "project_management", "category": "Project Management", "level": "expert"},
                    {"name": "Jira", "category_id": "tools", "category": "Tools & Platforms", "level": "advanced"},
                    {"name": "Team Leadership", "category_id": "leadership", "category": "Leadership", "level": "advanced"},
                    {"name": "Risk Management", "category_id": "project_management", "category": "Project Management", "level": "intermediate"}
                ]
            }
        }
        
        # Add default skills for templates that don't have sample content
        if template_id not in sample_content:
            return {
                "personal_info": {
                    "full_name": "Your Name",
                    "email": "your.email@example.com",
                    "phone": "(555) 123-4567",
                    "location": "City, State",
                    "linkedin": "linkedin.com/in/yourprofile",
                    "github": "github.com/yourusername"
                },
                "professional_summary": "Experienced professional with expertise in relevant skills and technologies.",
                "skills": [
                    {"name": "Skill 1", "category_id": "programming", "category": "Programming Languages", "level": "expert"},
                    {"name": "Skill 2", "category_id": "tools", "category": "Tools & Platforms", "level": "advanced"},
                    {"name": "Skill 3", "category_id": "communication", "category": "Communication", "level": "intermediate"}
                ]
            }
        
        return sample_content.get(template_id, {})
    
    async def search_templates(self, query: str) -> List[Dict[str, Any]]:
        """Search templates by name, description, or profession."""
        query_lower = query.lower()
        results = []
        
        for template in self.templates_metadata.values():
            if (query_lower in template["name"].lower() or
                query_lower in template["description"].lower() or
                any(query_lower in prof.lower() for prof in template["professions"])):
                results.append(template)
        
        return results

# Global template service instance
template_service = TemplateService()
