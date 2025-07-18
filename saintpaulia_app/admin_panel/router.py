# admin_panel/router.py

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from admin_panel import repository as admin_repository
from admin_panel import schemas as admin_schemas
from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User

from saintpaulia_app.admin_panel.photo_logs_router import router as photo_logs_router

router = APIRouter(tags=["Admin"])

router.include_router(photo_logs_router, prefix="/photo-logs", tags=["Admin: Photo Logs"])

def admin_required(current_user: User = Depends(get_current_user)) -> User:
    print(f"Current user: {current_user.role.name}")
    if current_user.role.name not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Access forbidden")
    return current_user


@router.get("/users/{user_id}/varieties", response_model=admin_schemas.UserVarietiesResponse)
async def get_user_varieties(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(admin_required)
):
    user = await admin_repository.get_user_by_id(user_id, db)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    varieties = await admin_repository.get_varieties_by_user(user_id, db)
    return {
        "user": user,
        "varieties": varieties
    }
