"""Authentication schemas"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
import uuid


class UserBase(BaseModel):
    """Base user schema"""
    username: str
    email: Optional[EmailStr] = None


class UserCreate(UserBase):
    """User creation schema"""
    password: str
    role: str = "analyst"


class UserLogin(BaseModel):
    """User login schema"""
    username: str
    password: str


class UserResponse(UserBase):
    """User response schema"""
    id: uuid.UUID
    role: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Token response schema"""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenData(BaseModel):
    """Token data schema"""
    user_id: Optional[str] = None
    username: Optional[str] = None
    role: Optional[str] = None
