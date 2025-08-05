import PyPDF2
from docx import Document
from io import BytesIO
from typing import Optional, Dict, Any
import re
import json
from pdfminer.high_level import extract_text as pdfminer_extract_text


class FileParser:
    @staticmethod
    def parse_pdf(file_content: bytes) -> str:
        """Extract text from PDF file using multiple libraries for better results"""
        try:
            # First try with PyPDF2
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            # If PyPDF2 extraction is poor (common with complex PDFs), try pdfminer
            if len(text.strip()) < 100 or text.count('\n') < 5:
                try:
                    pdf_file = BytesIO(file_content)
                    text = pdfminer_extract_text(pdf_file)
                except Exception as inner_e:
                    print(f"Error with pdfminer extraction: {inner_e}")
            
            # Clean up the text
            text = FileParser.clean_extracted_text(text)
            
            return text.strip()
            
        except Exception as e:
            print(f"Error parsing PDF: {e}")
            # Fallback to pdfminer if PyPDF2 fails completely
            try:
                pdf_file = BytesIO(file_content)
                text = pdfminer_extract_text(pdf_file)
                text = FileParser.clean_extracted_text(text)
                return text.strip()
            except Exception as fallback_e:
                print(f"Error with fallback PDF parsing: {fallback_e}")
                return ""
    
    @staticmethod
    def parse_docx(file_content: bytes) -> str:
        """Extract text from Word document"""
        try:
            doc_file = BytesIO(file_content)
            doc = Document(doc_file)
            
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            
            return text.strip()
            
        except Exception as e:
            print(f"Error parsing DOCX: {e}")
            return ""
    
    @staticmethod
    def parse_file(filename: str, file_content: bytes) -> Optional[str]:
        """Parse file based on extension"""
        filename_lower = filename.lower()
        
        if filename_lower.endswith('.pdf'):
            return FileParser.parse_pdf(file_content)
        elif filename_lower.endswith('.docx'):
            return FileParser.parse_docx(file_content)
        elif filename_lower.endswith('.txt'):
            return file_content.decode('utf-8')
        else:
            return None

    @staticmethod
    def clean_extracted_text(text: str) -> str:
        """Clean up extracted text to improve parsing quality"""
        if not text:
            return ""
            
        # Replace multiple spaces with a single space
        text = re.sub(r'\s+', ' ', text)
        
        # Fix common PDF extraction issues
        text = text.replace('•', '\n• ')
        
        # Ensure proper spacing after periods, commas, and other punctuation
        text = re.sub(r'([.!?])([A-Z])', r'\1 \2', text)
        
        # Normalize line breaks
        text = re.sub(r'\n+', '\n', text)
        
        return text
    
    @staticmethod
    def pre_process_resume(text: str) -> Dict[str, Any]:
        """Attempt to extract structured information from resume text"""
        result = {
            "sections": {},
            "detected_sections": []
        }
        
        # Common resume section headers
        section_patterns = {
            "contact": r"(?:CONTACT|PERSONAL)\s*(?:INFORMATION|INFO|DETAILS)",
            "summary": r"(?:PROFESSIONAL\s*)?SUMMARY|PROFILE|OBJECTIVE|ABOUT\s*ME",
            "experience": r"(?:WORK|PROFESSIONAL)\s*EXPERIENCE|EMPLOYMENT\s*HISTORY",
            "education": r"EDUCATION(?:AL)?\s*(?:BACKGROUND|HISTORY)?",
            "skills": r"(?:TECHNICAL\s*)?SKILLS|EXPERTISE|COMPETENCIES",
            "projects": r"PROJECTS|PROJECT\s*EXPERIENCE",
            "certifications": r"CERTIFICATIONS|CERTIFICATES|ACCREDITATIONS"
        }
        
        # Try to identify sections
        lines = text.split('\n')
        current_section = None
        section_content = {}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Check if this line is a section header
            found_section = False
            for section_name, pattern in section_patterns.items():
                if re.search(pattern, line.upper()):
                    current_section = section_name
                    section_content[current_section] = []
                    result["detected_sections"].append(current_section)
                    found_section = True
                    break
            
            if not found_section and current_section:
                section_content[current_section].append(line)
        
        # Process each section's content
        for section, content in section_content.items():
            result["sections"][section] = "\n".join(content)
        
        # Try to extract contact information
        if "contact" in section_content or not section_content:  # If no sections found, try whole document
            contact_text = section_content.get("contact", []) if section_content else text
            contact_text = "\n".join(contact_text) if isinstance(contact_text, list) else contact_text
            
            # Extract email
            email_match = re.search(r'[\w.+-]+@[\w-]+\.[\w.-]+', contact_text or text)
            if email_match:
                result["email"] = email_match.group(0)
                
            # Extract phone
            phone_match = re.search(r'\(?\d{3}\)?[-.]?\s*\d{3}[-.]?\s*\d{4}', contact_text or text)
            if phone_match:
                result["phone"] = phone_match.group(0)
                
            # Try to extract name (usually at the top)
            if lines and len(lines[0].split()) <= 4:  # Names are usually short
                result["name"] = lines[0].strip()
        
        return result

file_parser = FileParser()
