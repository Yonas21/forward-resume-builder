#!/usr/bin/env python3
"""
Test script for OpenRouter integration.
Run this to verify that the OpenRouter API is working correctly.
"""

import asyncio
import os
from openai import OpenAI
from core.config import settings

async def test_openrouter_connection():
    """Test the OpenRouter connection and basic functionality."""
    
    print("🔍 Testing OpenRouter Integration...")
    print(f"Model: {settings.open_router_model}")
    print(f"API Key configured: {'Yes' if settings.open_router_key else 'No'}")
    
    if not settings.open_router_key:
        print("❌ OPEN_ROUTER_KEY not found in environment variables")
        print("Please set OPEN_ROUTER_KEY in your .env file")
        return False
    
    try:
        # Initialize OpenAI client with OpenRouter
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=settings.open_router_key,
        )
        
        print("✅ OpenRouter client initialized successfully")
        
        # Test a simple completion
        print("🧪 Testing basic completion...")
        
        response = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "https://resume-builder.local",
                "X-Title": "Resume Builder",
            },
            extra_body={},
            model=settings.open_router_model,
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello from OpenRouter!' in a creative way."
                }
            ],
            max_tokens=50,
            temperature=0.7,
        )
        
        result = response.choices[0].message.content
        print(f"✅ Test completion successful!")
        print(f"Response: {result}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing OpenRouter: {e}")
        return False

async def test_resume_parsing():
    """Test resume parsing functionality."""
    
    print("\n📄 Testing Resume Parsing...")
    
    try:
        from openai_service import openai_service
        
        # Sample resume text
        sample_resume = """
        JOHN DOE
        john.doe@email.com | (555) 123-4567 | San Francisco, CA
        linkedin.com/in/johndoe | github.com/johndoe
        
        PROFESSIONAL SUMMARY
        Experienced software engineer with 5+ years developing web applications using React, Node.js, and Python.
        
        EXPERIENCE
        Senior Software Engineer | Tech Corp | 2021-Present
        - Led development of customer portal using React and Node.js
        - Improved application performance by 40%
        - Mentored 3 junior developers
        
        Software Engineer | Startup Inc | 2019-2021
        - Built REST APIs using Python Flask
        - Implemented CI/CD pipelines
        - Collaborated with cross-functional teams
        
        EDUCATION
        Bachelor of Science in Computer Science | University of Technology | 2015-2019
        GPA: 3.8
        
        SKILLS
        JavaScript, Python, React, Node.js, SQL, Git, AWS
        """
        
        print("🧪 Testing resume parsing...")
        parsed_resume = await openai_service.parse_resume(sample_resume)
        
        print("✅ Resume parsing successful!")
        print(f"Parsed name: {parsed_resume.personal_info.full_name}")
        print(f"Parsed email: {parsed_resume.personal_info.email}")
        print(f"Number of skills: {len(parsed_resume.skills)}")
        print(f"Number of experiences: {len(parsed_resume.experience)}")
        
        return parsed_resume
        
    except Exception as e:
        print(f"❌ Error testing resume parsing: {e}")
        return None

async def test_cover_letter_generation(parsed_resume):
    """Test cover letter generation functionality."""
    
    print("\n📝 Testing Cover Letter Generation...")
    
    try:
        from openai_service import openai_service
        from models import JobDescription
        
        # Sample job description
        job_description = JobDescription(
            title="Senior Software Engineer",
            company="Tech Innovations Inc",
            description="We are looking for a Senior Software Engineer to join our team and help build scalable web applications. The ideal candidate will have experience with React, Node.js, and cloud technologies.",
            requirements=[
                "5+ years of software development experience",
                "Strong knowledge of React and Node.js",
                "Experience with cloud platforms (AWS, Azure, or GCP)",
                "Excellent problem-solving skills",
                "Strong communication and teamwork abilities"
            ]
        )
        
        print("🧪 Testing cover letter generation...")
        cover_letter = await openai_service.generate_cover_letter(parsed_resume, job_description)
        
        print("✅ Cover letter generation successful!")
        print(f"Cover letter length: {len(cover_letter)} characters")
        print("\n📄 Cover Letter Preview (first 300 chars):")
        print(cover_letter[:300] + "..." if len(cover_letter) > 300 else cover_letter)
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing cover letter generation: {e}")
        return False

async def main():
    """Run all tests."""
    print("🚀 OpenRouter Integration Test Suite")
    print("=" * 50)
    
    # Test basic connection
    connection_ok = await test_openrouter_connection()
    
    if connection_ok:
        # Test resume parsing
        parsed_resume = await test_resume_parsing()
        
        if parsed_resume:
            # Test cover letter generation
            cover_letter_ok = await test_cover_letter_generation(parsed_resume)
            
            if cover_letter_ok:
                print("\n🎉 All tests passed! OpenRouter integration is working correctly.")
            else:
                print("\n⚠️  Resume parsing works, but cover letter generation failed.")
        else:
            print("\n⚠️  Basic connection works, but resume parsing failed.")
    else:
        print("\n❌ Basic connection failed. Please check your configuration.")
    
    print("\n📋 Required Environment Variables:")
    print("OPEN_ROUTER_KEY=your_openrouter_api_key")
    print("OPEN_ROUTER_MODEL=openai/gpt-oss-20b:free (free model)")

if __name__ == "__main__":
    asyncio.run(main())
