"""Multimodal analysis API endpoints"""
from fastapi import APIRouter, Depends, UploadFile, File, Form
from ..models.db import User
from ..services.security import get_current_user, require_analyst
from ..services.llm_service import llm_service
from ..config import settings

router = APIRouter(prefix="/api/multimodal", tags=["multimodal"])


import base64

@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...),
    task_type: str = Form("image_description"),
    current_user: User = Depends(require_analyst)
):
    """Analyze image with vision model"""
    # Read image
    image_content = await file.read()
    
    # Base64 encode image for Ollama
    encoded_image = base64.b64encode(image_content).decode('utf-8')
    
    model = settings.OLLAMA_MODEL_VISION
    
    try:
        if task_type == "ocr":
            prompt = "Extract all text from this image exactly as written. Return only the extracted text, nothing else."
        elif task_type == "code_analysis":
            prompt = "Analyze the code in this image. Explain what it does, what language it is, and identify any issues."
        else:
            prompt = "Describe this image in detail."
            
        analysis = await llm_service.generate(
            model=model,
            prompt=prompt,
            images=[encoded_image]
        )
        
        return {
            "analysis": analysis,
            "extracted_text": analysis if task_type == "ocr" else None,
            "task_type": task_type,
            "model_used": model
        }
    except Exception as e:
        print(f"Multimodal analysis error: {e}")
        return {
            "analysis": f"Error analyzing image: {str(e)}",
            "extracted_text": None,
            "task_type": task_type,
            "model_used": model,
            "error": str(e)
        }
