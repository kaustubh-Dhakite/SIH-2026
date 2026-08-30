"""SQLAlchemy ORM models"""
from sqlalchemy import Column, String, Integer, Float, Boolean, Text, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from ..database import Base


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, nullable=False, index=True)
    email = Column(String, unique=True, nullable=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst")  # admin, operator, analyst, viewer
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    knowledge_bases = relationship("KnowledgeBase", back_populates="owner")
    agents = relationship("Agent", back_populates="owner")
    tasks = relationship("Task", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class KnowledgeBase(Base):
    """Knowledge Base model"""
    __tablename__ = "knowledge_bases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    classification = Column(String, nullable=True)  # public, confidential, secret
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="knowledge_bases")
    documents = relationship("Document", back_populates="knowledge_base", cascade="all, delete-orphan")


class Document(Base):
    """Document model"""
    __tablename__ = "documents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kb_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_bases.id"))
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=True)
    file_type = Column(String, nullable=True)  # pdf, docx, txt, image
    size_bytes = Column(Integer, nullable=True)
    chunks_count = Column(Integer, default=0)
    indexed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    status = Column(String, default="processing")  # processing, indexed, failed
    
    # Relationships
    knowledge_base = relationship("KnowledgeBase", back_populates="documents")


class Agent(Base):
    """Agent model"""
    __tablename__ = "agents"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=True)
    default_model = Column(String, default="qwen:8b")
    tools = Column(JSON, default=list)  # ["rag", "ocr", "code_sandbox", "file_ops"]
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    owner = relationship("User", back_populates="agents")
    tasks = relationship("Task", back_populates="agent", cascade="all, delete-orphan")


class Task(Base):
    """Task execution model"""
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_id = Column(UUID(as_uuid=True), ForeignKey("agents.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    input_query = Column(Text, nullable=False)
    status = Column(String, default="pending")  # pending, running, completed, failed, timeout
    result = Column(Text, nullable=True)
    deliverable_url = Column(String, nullable=True)
    trace = Column(JSON, default=list)  # Execution trace steps
    model_used = Column(String, nullable=True)
    duration_seconds = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    agent = relationship("Agent", back_populates="tasks")
    user = relationship("User", back_populates="tasks")


class AuditLog(Base):
    """Audit log model"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)  # login, create_agent, upload_doc, execute_task, etc.
    resource_type = Column(String, nullable=True)  # agent, kb, document, task
    resource_id = Column(String, nullable=True)
    status = Column(String, nullable=False)  # success, failure
    details = Column(JSON, default=dict)
    ip_address = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="audit_logs")
