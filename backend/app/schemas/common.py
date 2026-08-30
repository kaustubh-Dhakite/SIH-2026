"""Common schemas"""
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class StatusResponse(BaseModel):
    """Standard status response"""
    status: str
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    services: Dict[str, str]
    timestamp: datetime


class PaginationParams(BaseModel):
    """Pagination parameters"""
    page: int = 1
    page_size: int = 50
    
    
class ErrorResponse(BaseModel):
    """Error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
