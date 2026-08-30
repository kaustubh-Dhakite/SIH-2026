"""Authentication API endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..schemas.auth import UserCreate, UserLogin, TokenResponse, UserResponse
from ..services.auth_service import (
    authenticate_user,
    create_access_token,
    create_user,
    get_user_by_username
)
from ..services.security import log_audit

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse)
async def register(user: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user exists
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create user
    db_user = create_user(db, user)
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(db_user.id), "username": db_user.username, "role": db_user.role}
    )
    
    # Log audit
    log_audit(db, db_user.id, "register", status="success")
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(db_user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """Login user"""
    user = authenticate_user(db, credentials.username, credentials.password)
    
    if not user:
        log_audit(db, None, "login", status="failure", details={"username": credentials.username})
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create token
    access_token = create_access_token(
        data={"sub": str(user.id), "username": user.username, "role": user.role}
    )
    
    # Log audit
    log_audit(db, user.id, "login", status="success")
    
    return TokenResponse(
        access_token=access_token,
        user=UserResponse.from_orm(user)
    )


@router.post("/logout")
async def logout(db: Session = Depends(get_db)):
    """Logout user (client-side token removal)"""
    return {"message": "Logged out successfully"}
