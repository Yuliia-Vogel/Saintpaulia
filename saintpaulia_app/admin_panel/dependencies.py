from fastapi import Depends, HTTPException, status
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User 
from saintpaulia_app.auth.schemas import UserRole

def admin_required(current_user: User = Depends(get_current_user)):
    if current_user.role.name not in ("admin", "superadmin"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access forbidden. Admin role required"
        )
    return current_user
