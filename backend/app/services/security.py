"""Security and RBAC service"""
from typing import Optional, List
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from ..database import get_db
from ..models.db import User, AuditLog
from .auth_service import decode_access_token
import uuid

security = HTTPBearer()

# Role hierarchy
ROLE_HIERARCHY = {
    "admin": 4,
    "operator": 3,
    "analyst": 2,
    "viewer": 1
}


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current authenticated user"""
    token = credentials.credentials
    token_data = decode_access_token(token)
    
    if token_data is None or token_data.user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    
    return user


def require_role(required_roles: List[str]):
    """Dependency to check if user has required role"""
    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in required_roles:
            # Check hierarchy
            user_level = ROLE_HIERARCHY.get(current_user.role, 0)
            min_required_level = max([ROLE_HIERARCHY.get(r, 999) for r in required_roles])
            
            if user_level < min_required_level:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions. Required roles: {', '.join(required_roles)}"
                )
        return current_user
    return role_checker


def log_audit(
    db: Session,
    user_id: Optional[uuid.UUID],
    action: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    status: str = "success",
    details: Optional[dict] = None,
    ip_address: Optional[str] = None
):
    """Log audit event"""
    audit_log = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=str(resource_id) if resource_id else None,
        status=status,
        details=details or {},
        ip_address=ip_address
    )
    db.add(audit_log)
    db.commit()


# Role-based decorators
require_admin = require_role(["admin"])
require_operator = require_role(["admin", "operator"])
require_analyst = require_role(["admin", "operator", "analyst"])
require_viewer = require_role(["admin", "operator", "analyst", "viewer"])
