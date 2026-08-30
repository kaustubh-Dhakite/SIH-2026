"""Knowledge base schemas"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid


class KnowledgeBaseBase(BaseModel):
    """Base KB schema"""
    name: str
    classification: Optional[str] = "public"


class KnowledgeBaseCreate(KnowledgeBaseBase):
    """KB creation schema"""
    pass


class KnowledgeBaseResponse(KnowledgeBaseBase):
    """KB response schema"""
    id: uuid.UUID
    owner_id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    document_count: int = 0
    
    class Config:
        from_attributes = True


class DocumentBase(BaseModel):
    """Base document schema"""
    filename: str
    file_type: Optional[str] = None
    kb_id: uuid.UUID


class DocumentUpload(BaseModel):
    """Document upload schema"""
    kb_id: uuid.UUID


class DocumentResponse(BaseModel):
    """Document response schema"""
    id: uuid.UUID
    kb_id: uuid.UUID
    filename: str
    file_path: Optional[str] = None
    file_type: Optional[str] = None
    size_bytes: Optional[int] = None
    chunks_count: int = 0
    status: str
    indexed_at: Optional[datetime] = None
    created_at: datetime
    created_by: uuid.UUID
    
    class Config:
        from_attributes = True


class RAGQueryRequest(BaseModel):
    """RAG query request"""
    query: str
    kb_ids: Optional[List[uuid.UUID]] = []
    top_k: int = 5
    score_threshold: float = 0.7


class RAGResult(BaseModel):
    """RAG retrieval result"""
    text: str
    source: str
    score: float
    metadata: Optional[dict] = {}


class RAGQueryResponse(BaseModel):
    """RAG query response"""
    results: List[RAGResult]
    query: str
