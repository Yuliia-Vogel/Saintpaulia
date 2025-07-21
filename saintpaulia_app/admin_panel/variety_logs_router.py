from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from saintpaulia_app.database import get_db
from saintpaulia_app.auth.models import User
from saintpaulia_app.admin_panel.dependencies import admin_required
from saintpaulia_app.saintpaulia.schemas import SaintpauliaLogResponse
from saintpaulia_app.admin_panel.variety_logs_repository import fetch_variety_logs

router = APIRouter(prefix="/variety")


@router.get("/{variety_id}", response_model=list[SaintpauliaLogResponse])
async def get_variety_logs(variety_id: int, 
                           session: AsyncSession = Depends(get_db),
                           current_admin: User = Depends(admin_required)):
    """
    Отримати журнали дій для конкретного сорту.
    """
    try:
        logs = await fetch_variety_logs(variety_id, session)
        
        if not logs:
            raise HTTPException(status_code=404, detail="No logs found for this variety")   
        
        return logs
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))