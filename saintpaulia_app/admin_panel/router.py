# admin_panel/router.py
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status   
from sqlalchemy.ext.asyncio import AsyncSession

from admin_panel import repository as admin_repository
from admin_panel import schemas as admin_schemas
from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from saintpaulia_app.auth.schemas import UserRoleUpdate, UserOut
from saintpaulia_app.admin_panel.dependencies import admin_required 
from saintpaulia_app.admin_panel.photo_logs_router import router as photo_logs_router
from saintpaulia_app.admin_panel.variety_logs_router import router as varieties_router

router = APIRouter(tags=["Admin"])

router.include_router(photo_logs_router, prefix="/photo-logs")
router.include_router(varieties_router, prefix="/variety-logs")


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


@router.get("/users", response_model=List[admin_schemas.UserShortInfo])
async def get_all_users(
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(admin_required),
):
    return await admin_repository.get_all_users(db)


@router.put("/users/{user_id}/role", response_model=admin_schemas.UserShortInfo)
async def update_user_role(
    user_id: int,
    new_role: UserRoleUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: User = Depends(admin_required)):

    updated_user = await admin_repository.update_user_role(user_id, new_role.role, db)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user


@router.get("/users/{user_id}", response_model=UserOut)
async def get_user(user_id: int, 
                   db: AsyncSession = Depends(get_db),
                   current_admin: User = Depends(admin_required)):
    user = await admin_repository.get_user_by_id(user_id, db)
    if not user:    
        raise HTTPException(status_code=404, detail="User not found")   
    return user