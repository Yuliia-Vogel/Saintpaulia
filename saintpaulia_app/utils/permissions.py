# utils/permissions.py

from fastapi import HTTPException, status
from saintpaulia_app.auth.models import User

def check_role_change_permission(current_admin: User, target_user: User):

    if current_admin.role == "admin" and target_user.role == "superadmin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to modify a superadmin"
        )
    if current_admin.id == target_user.id:
        raise HTTPException(400, detail="You cannot change your own role")
    if current_admin.role == "superadmin":
        return  # ок, дозвіл на все
