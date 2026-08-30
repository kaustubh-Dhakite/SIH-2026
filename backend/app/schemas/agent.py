"""Agent-related schemas"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid


class AgentBase(BaseModel):
    """Base agent schema"""
    name: str
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: str = "qwen:8b"
    tools: List[str] = []


class AgentCreate(AgentBase):
    """Agent creation schema"""
    pass


class AgentUpdate(BaseModel):
    """Agent update schema"""
    name: Optional[str] = None
    description: Optional[str] = None
    system_prompt: Optional[str] = None
    default_model: Optional[str] = None
    tools: Optional[List[str]] = None


class AgentResponse(AgentBase):
    """Agent response schema"""
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    """Task creation schema"""
    agent_id: uuid.UUID
    input_query: str
    kb_ids: Optional[List[uuid.UUID]] = []


class TraceStep(BaseModel):
    """Execution trace step"""
    step: int
    action: str
    status: str  # running, completed, failed
    duration: Optional[float] = None
    details: Optional[Dict[str, Any]] = None


class TaskResponse(BaseModel):
    """Task response schema"""
    id: uuid.UUID
    agent_id: uuid.UUID
    user_id: uuid.UUID
    input_query: str
    status: str
    result: Optional[str] = None
    deliverable_url: Optional[str] = None
    trace: List[Dict[str, Any]] = []
    model_used: Optional[str] = None
    duration_seconds: Optional[float] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class TaskQueryRequest(BaseModel):
    """Task query request"""
    query: str
    kb_ids: Optional[List[uuid.UUID]] = []
    options: Optional[Dict[str, Any]] = {}
