"""LLM service for Ollama integration"""
import httpx
from typing import Optional, List, Dict, Any
from ..config import settings


class LLMService:
    """Service for interacting with Ollama"""
    
    def __init__(self):
        self.base_url = settings.OLLAMA_BASE_URL
        self.timeout = 300.0  # 5 minutes timeout for LLM calls
    
    async def generate(
        self,
        model: str,
        prompt: str,
        system: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        images: Optional[List[str]] = None
    ) -> str:
        """Generate text completion"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                payload = {
                    "model": model,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": temperature,
                        "num_predict": max_tokens or 1024,  # Cap tokens for speed
                        "top_k": 20,          # Fast sampling
                        "top_p": 0.9,
                        "repeat_penalty": 1.1
                    }
                }
                
                if system:
                    payload["system"] = system
                
                if max_tokens:
                    payload["options"]["num_predict"] = max_tokens
                    
                if images:
                    payload["images"] = images
                
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json=payload
                )
                response.raise_for_status()
                result = response.json()
                return result.get("response", "")
            except Exception as e:
                print(f"LLM generation error: {e}")
                return f"Error generating response: {str(e)}"
    
    async def embed(self, model: str, text: str) -> List[float]:
        """Generate embeddings"""
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            try:
                response = await client.post(
                    f"{self.base_url}/api/embeddings",
                    json={
                        "model": model,
                        "prompt": text
                    }
                )
                response.raise_for_status()
                result = response.json()
                return result.get("embedding", [])
            except Exception as e:
                print(f"Embedding error: {e}")
                return []
    
    async def list_models(self) -> List[Dict[str, Any]]:
        """List available models"""
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(f"{self.base_url}/api/tags")
                response.raise_for_status()
                result = response.json()
                return result.get("models", [])
            except Exception as e:
                print(f"List models error: {e}")
                return []
    
    async def check_health(self) -> bool:
        """Check if Ollama is healthy"""
        async with httpx.AsyncClient(timeout=5.0) as client:
            try:
                response = await client.get(f"{self.base_url}/api/tags")
                return response.status_code == 200
            except:
                return False


# Singleton instance
llm_service = LLMService()
