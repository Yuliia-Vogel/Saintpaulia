from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from saintpaulia_app.photos.models import PhotoLog, UploadedPhoto
from saintpaulia_app.auth.models import User
from saintpaulia_app.photos.schemas import PhotoLogEntry
from sqlalchemy.exc import SQLAlchemyError


async def fetch_photo_logs_for_variety(variety_id: int, session: AsyncSession) -> list[PhotoLogEntry]:
    try:
        stmt = (
            select(PhotoLog, UploadedPhoto.file_url, User.email)
            .join(UploadedPhoto, PhotoLog.photo_id == UploadedPhoto.id)
            .join(User, PhotoLog.user_id == User.id)
            .where(PhotoLog.variety_id == variety_id)
            .order_by(PhotoLog.timestamp.desc())
        )

        result = session.execute(stmt)
        logs = result.all()

        if not logs:
            return []

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

    except SQLAlchemyError as e:
        raise RuntimeError(f"Database error while fetching photo logs: {str(e)}")
