#!/usr/bin/env python3
"""
Test script to verify serialization fixes for resume templates.
"""
import asyncio
import json
from datetime import datetime, date
from models import Skill, SkillLevel, PersonalInfo, Resume
from utils.redis_cache import cache

async def test_serialization():
    """Test serialization of various data types."""
    
    # Test 1: Basic data types
    print("Testing basic data types...")
    test_data = {
        "string": "test",
        "number": 123,
        "boolean": True,
        "list": [1, 2, 3],
        "dict": {"key": "value"}
    }
    
    await cache.set("test:basic", test_data)
    retrieved = await cache.get("test:basic")
    print(f"Basic data test: {'PASS' if retrieved == test_data else 'FAIL'}")
    
    # Test 2: Datetime objects
    print("\nTesting datetime objects...")
    datetime_data = {
        "created_at": datetime.now(),
        "date": date.today()
    }
    
    await cache.set("test:datetime", datetime_data)
    retrieved = await cache.get("test:datetime")
    print(f"Datetime test: {'PASS' if retrieved else 'FAIL'}")
    
    # Test 3: Pydantic models
    print("\nTesting Pydantic models...")
    skill = Skill(
        name="Python",
        category_id="programming",
        category="Programming",
        level=SkillLevel.expert
    )
    
    await cache.set("test:skill", skill)
    retrieved = await cache.get("test:skill")
    print(f"Skill model test: {'PASS' if retrieved else 'FAIL'}")
    
    # Test 4: Complex resume object
    print("\nTesting complex resume object...")
    resume = Resume(
        personal_info=PersonalInfo(
            full_name="John Doe",
            email="john@example.com"
        ),
        skills=[
            Skill(name="Python", category_id="tech", category="Technical", level=SkillLevel.expert),
            Skill(name="JavaScript", category_id="tech", category="Technical", level=SkillLevel.advanced)
        ],
        professional_summary="Experienced developer"
    )
    
    await cache.set("test:resume", resume)
    retrieved = await cache.get("test:resume")
    print(f"Resume model test: {'PASS' if retrieved else 'FAIL'}")
    
    # Test 5: Template metadata
    print("\nTesting template metadata...")
    template_data = {
        "id": "software_engineer",
        "name": "Software Engineer",
        "description": "Modern template for tech professionals",
        "professions": ["Software Engineer", "Developer"],
        "sections": ["personal", "experience", "skills"],
        "preview_image": "/templates/software-engineer.png",
        "category": "technology"
    }
    
    await cache.set("test:template", template_data)
    retrieved = await cache.get("test:template")
    print(f"Template metadata test: {'PASS' if retrieved == template_data else 'FAIL'}")
    
    # Clean up
    await cache.delete("test:basic")
    await cache.delete("test:datetime")
    await cache.delete("test:skill")
    await cache.delete("test:resume")
    await cache.delete("test:template")
    
    print("\nSerialization tests completed!")

if __name__ == "__main__":
    asyncio.run(test_serialization())
