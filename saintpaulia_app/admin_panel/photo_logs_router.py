from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from saintpaulia_app.database import get_db
from saintpaulia_app.auth.models import User 
from saintpaulia_app.photos.schemas import PhotoLogEntry
from saintpaulia_app.admin_panel.photo_logs_repository import fetch_photo_logs_for_variety
from saintpaulia_app.admin_panel.dependencies import admin_required

router = APIRouter(prefix="/variety")


@router.get("/{variety_id}", response_model=list[PhotoLogEntry])
async def get_photo_logs_for_variety(variety_id: int, 
                                     session: AsyncSession = Depends(get_db),
                                     current_admin: User = Depends(admin_required)
                                     ):
    try:
        logs = await fetch_photo_logs_for_variety(variety_id, session)

        if not logs:
            raise HTTPException(status_code=404, detail="No photo logs found for this variety")

        return logs

    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
