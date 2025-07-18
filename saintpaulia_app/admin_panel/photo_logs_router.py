from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import select

from saintpaulia_app.database import get_db
from saintpaulia_app.photos.models import PhotoLog, UploadedPhoto
from saintpaulia_app.auth.models import User
from saintpaulia_app.photos.schemas import PhotoLogEntry

router = APIRouter(prefix="/photos/logs", tags=["Photo Logs"])


@router.get("/variety/{variety_id}", response_model=list[PhotoLogEntry])
async def get_photo_logs_for_variety(
    variety_id: int,
    session: AsyncSession = Depends(get_db),
):
    # JOIN PhotoLog -> UploadedPhoto -> User
    stmt = (
        select(PhotoLog, UploadedPhoto.file_url, User.email)
        .join(UploadedPhoto, PhotoLog.photo_id == UploadedPhoto.id)
        .join(User, PhotoLog.user_id == User.id)
        .where(PhotoLog.variety_id == variety_id)
        .order_by(PhotoLog.timestamp.desc())
    )

    result = session.execute(stmt)
    logs = result.all()

    return [
        PhotoLogEntry(
            id=log.PhotoLog.id,
            action=log.PhotoLog.action,
            timestamp=log.PhotoLog.timestamp,
            photo_id=log.PhotoLog.photo_id,
            photo_filename=log.file_url,
            user_email=log.email
        )
        for log in logs
    ]
