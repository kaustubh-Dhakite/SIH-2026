"""Model management API endpoints"""
from fastapi import APIRouter, Depends
from ..models.db import User
from ..services.security import get_current_user
from ..services.model_router import model_router

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
async def list_models(current_user: User = Depends(get_current_user)):
    """List available models"""
    return await model_router.get_model_info()


@router.get("/{model_name}/info")
async def get_model_info(model_name: str, current_user: User = Depends(get_current_user)):
    """Get detailed model information"""
    models_info = await model_router.get_model_info()
    model = next((m for m in models_info["models"] if m["id"] == model_name), None)
    
    if not model:
        return {"error": "Model not found"}
    
    return {"model": model}


@router.post("/switch")
async def switch_model(model_name: str, current_user: User = Depends(get_current_user)):
    """Switch active model"""
    # In a real implementation, this would update user preferences
    return {
        "selected_model": model_name,
        "message": f"Switched to {model_name}"
    }
