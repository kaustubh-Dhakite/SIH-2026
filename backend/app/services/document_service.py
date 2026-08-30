"""Document processing service"""
import os
from typing import List, Optional
from pathlib import Path
import PyPDF2
from docx import Document as DocxDocument
from PIL import Image
from ..config import settings


class DocumentService:
    """Service for document processing"""
    
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        os.makedirs(self.upload_dir, exist_ok=True)
    
    def save_file(self, file_content: bytes, filename: str, kb_id: str) -> str:
        """Save uploaded file"""
        kb_dir = os.path.join(self.upload_dir, str(kb_id))
        os.makedirs(kb_dir, exist_ok=True)
        
        file_path = os.path.join(kb_dir, filename)
        with open(file_path, 'wb') as f:
            f.write(file_content)
        
        return file_path
    
    def extract_text(self, file_path: str, file_type: str) -> str:
        """Extract text from document"""
        try:
            if file_type == "pdf":
                return self._extract_pdf(file_path)
            elif file_type == "docx":
                return self._extract_docx(file_path)
            elif file_type == "txt":
                return self._extract_txt(file_path)
            elif file_type == "image":
                import asyncio
                return asyncio.run(self._extract_image(file_path))
            else:
                return ""
        except Exception as e:
            print(f"Text extraction error: {e}")
            return ""

    async def _extract_image(self, file_path: str) -> str:
        """Extract text from image using vision model"""
        try:
            import base64
            from .llm_service import llm_service
            with open(file_path, 'rb') as file:
                encoded_image = base64.b64encode(file.read()).decode('utf-8')
            
            prompt = "Extract all text from this image exactly as written. Return only the extracted text, nothing else."
            text = await llm_service.generate(
                model=settings.OLLAMA_MODEL_VISION,
                prompt=prompt,
                images=[encoded_image]
            )
            return text
        except Exception as e:
            print(f"Image extraction error: {e}")
            return ""
    
    def _extract_pdf(self, file_path: str) -> str:
        """Extract text from PDF"""
        text = ""
        try:
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    text += page.extract_text() + "\n\n"
        except Exception as e:
            print(f"PDF extraction error: {e}")
        return text
    
    def _extract_docx(self, file_path: str) -> str:
        """Extract text from DOCX"""
        try:
            doc = DocxDocument(file_path)
            text = "\n\n".join([para.text for para in doc.paragraphs])
            return text
        except Exception as e:
            print(f"DOCX extraction error: {e}")
            return ""
    
    def _extract_txt(self, file_path: str) -> str:
        """Extract text from TXT"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            print(f"TXT extraction error: {e}")
            return ""
    
    def chunk_text(self, text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < text_length:
                last_period = chunk.rfind('.')
                last_newline = chunk.rfind('\n')
                break_point = max(last_period, last_newline)
                
                if break_point > chunk_size // 2:
                    chunk = chunk[:break_point + 1]
                    end = start + break_point + 1
            
            chunks.append(chunk.strip())
            start = end - overlap if end < text_length else text_length
        
        return [c for c in chunks if c]
    
    def get_file_type(self, filename: str) -> str:
        """Get file type from filename"""
        ext = Path(filename).suffix.lower()
        type_map = {
            '.pdf': 'pdf',
            '.docx': 'docx',
            '.doc': 'docx',
            '.txt': 'txt',
            '.png': 'image',
            '.jpg': 'image',
            '.jpeg': 'image',
            '.webp': 'image'
        }
        return type_map.get(ext, 'unknown')
    
    def validate_file(self, filename: str, file_size: int) -> tuple[bool, Optional[str]]:
        """Validate uploaded file"""
        file_type = self.get_file_type(filename)
        
        if file_type == 'unknown':
            return False, "Unsupported file type"
        
        max_size = settings.MAX_FILE_SIZE_MB * 1024 * 1024
        if file_size > max_size:
            return False, f"File size exceeds {settings.MAX_FILE_SIZE_MB}MB limit"
        
        return True, None


# Singleton instance
document_service = DocumentService()
