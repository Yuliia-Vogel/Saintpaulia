import logging 

from datetime import datetime
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia.models import Saintpaulia
from saintpaulia_app.photos.models import UploadedPhoto, PhotoLog
from saintpaulia_app.photos.cloudinary_service import CloudinaryService

logger = logging.getLogger(__name__)


async def process_photo_upload(
    variety_id: int,
    file: UploadFile,
    current_user: User,
    session: AsyncSession
) -> UploadedPhoto:
    """
    Повна логіка завантаження фото: перевірки, завантаження на Cloudinary, збереження в БД.
    Повертає створений об'єкт фотографії.
    """
    # 1. Перевірка, що сорт існує (поки синхронно)
    result = session.execute(select(Saintpaulia).where(Saintpaulia.id == variety_id))
    variety = result.scalar_one_or_none()
    if not variety:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Сорт не знайдено")

    # 2. Перевірка прав доступу
    allowed_roles = ["admin", "superadmin"]
    if current_user.id != variety.owner_id and current_user.role.value not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="У вас немає прав для завантаження фото для цього сорту")

    # 3. Завантаження через сервіс Cloudinary
    try:
        upload_result = CloudinaryService.upload_image(file, current_user.email)
    except ValueError as e: # Наприклад, якщо сервіс валідує тип файлу
        logger.error(f"!!! Cloudinary service rejected the file: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    
    file_url = upload_result["secure_url"]
    public_id = upload_result["public_id"]

    # 4. Створення та збереження об'єктів в БД (поки синхронно)
    photo = UploadedPhoto(
        file_url=file_url,
        public_id=public_id,
        variety_id=variety.id,
        uploaded_by=current_user.id
    )
    session.add(photo)
    session.flush() # Отримуємо photo.id

    log = PhotoLog(
        photo_id=photo.id,
        variety_id=photo.variety_id,
        user_id=current_user.id,
        action="upload",
        timestamp=datetime.utcnow()
    )
    session.add(log)
    session.commit()
    
    session.refresh(photo) # Оновлюємо об'єкт з БД

    return photo



async def delete_photo(
    photo_id: int,
    current_user: User,
    session: AsyncSession
):
    """
    Логіка видалення фото: перевірки, видалення з Cloudinary, видалення з БД.
    """
    # 1. Знаходимо фото в БД
    result = session.execute(select(UploadedPhoto).where(UploadedPhoto.id == photo_id))
    photo = result.scalar_one_or_none()
    if not photo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Фото не знайдено")

    # 2. Перевірка прав доступу
    allowed_roles = ["admin", "superadmin"]
    print(current_user.role.value)
    if current_user.id != photo.uploaded_by and current_user.role.value not in allowed_roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="У вас немає прав для видалення цього фото")

    # 3. Видалення з Cloudinary
    try:
        CloudinaryService.delete_image(photo.public_id)
    except Exception as e:
        logger.error(f"!!! Failed to delete image from Cloudinary: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Не вдалося видалити фото з хмарного сервісу")

    # 4. Видалення з БД
    session.delete(photo)

    log = PhotoLog(
        photo_id=photo.id,
        variety_id=photo.variety_id,
        user_id=current_user.id,
        action="delete",
        timestamp=datetime.utcnow()
    )
    session.add(log)
    
    session.commit()