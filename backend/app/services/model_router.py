"""Model router for task classification and model selection"""
from typing import Dict, Any
from ..config import settings


class ModelRouter:
    """Routes tasks to appropriate models"""
    
    def __init__(self):
        self.models = {
            "main": settings.OLLAMA_MODEL_MAIN,
            "code": settings.OLLAMA_MODEL_CODE,
            "vision": settings.OLLAMA_MODEL_VISION,
            "embeddings": settings.OLLAMA_MODEL_EMBEDDINGS
        }
    
    def select_model(self, task_type: str = "general") -> str:
        """Select appropriate model for task"""
        model_map = {
            "code": self.models["code"],
            "vision": self.models["vision"],
            "analysis": self.models["main"],
            "general": self.models["main"]
        }
        return model_map.get(task_type, self.models["main"])
    
    async def get_model_info(self) -> Dict[str, Any]:
        """Get information about available models"""
        from .llm_service import llm_service
        try:
            available_models = await llm_service.list_models()
            models_list = []
            for m in available_models:
                models_list.append({
                    "name": m.get("name", ""),
                    "id": m.get("name", ""),
                    "type": "General",
                    "parameters": m.get("details", {}).get("parameter_size", "Unknown"),
                    "vram": "Unknown",
                    "status": "ready",
                    "description": m.get("details", {}).get("family", "Ollama model")
                })
            
            return {
                "models": models_list if models_list else [
                    {
                        "name": "Fallback Model",
                        "id": self.models["main"],
                        "type": "General",
                        "parameters": "Unknown",
                        "vram": "Unknown",
                        "status": "ready",
                        "description": "Fallback model when API fails"
                    }
                ],
                "current": self.models["main"]
            }
        except Exception as e:
            print(f"Error fetching models: {e}")
            return {
                "models": [
                    {
                        "name": "Llama 3.2 1B (Fallback)",
                        "id": "llama3.2:1b",
                        "type": "General",
                        "parameters": "1.3B",
                        "vram": "2GB",
                        "status": "ready",
                        "description": "Default fallback model"
                    }
                ],
                "current": self.models["main"]
            }


# Singleton instance
model_router = ModelRouter()
