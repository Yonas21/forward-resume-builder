import PyPDF2
from docx import Document
from io import BytesIO
from typing import Optional


class FileParser:
    @staticmethod
    def parse_pdf(file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            
            return text.strip()
            
        except Exception as e:
            print(f"Error parsing PDF: {e}")
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

file_parser = FileParser()
