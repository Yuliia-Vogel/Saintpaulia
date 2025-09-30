# saintpaulia_app/photos/service.py
import logging
from fastapi import UploadFile, HTTPException, status
from saintpaulia_app.photos.cloudinary_service import CloudinaryService, DEFAULT_ALLOWED_IMAGE_EXTENSIONS

logger = logging.getLogger(__name__)

def upload_photo(
    file: UploadFile, 
    user_email: str, 
    upload_type: str # 'avatar' або 'variety'
) -> dict:
    """
    Оркестратор завантаження фото. Визначає правила валідації та 
    папку на основі типу завантаження.
    """
    if upload_type == 'avatar':
        folder = "user_avatars"
        error_message = "Для аватара можна завантажити лише зображення."
        allowed_extensions = DEFAULT_ALLOWED_IMAGE_EXTENSIONS
    elif upload_type == 'variety':
        folder = "saintpaulia_varieties"
        error_message = "До опису сорту можна завантажити лише зображення."
        allowed_extensions = DEFAULT_ALLOWED_IMAGE_EXTENSIONS
    else:
        raise ValueError("Невідомий тип завантаження фото.")

    try:
        # 1. Валідація з правилами для конкретного випадку
        CloudinaryService.validate_file(file, allowed_extensions, error_message)
        
        # 2. Завантаження у правильну папку
        return CloudinaryService.upload_image(file.file, user_email, folder)

    except ValueError as e:
        logger.error(f"Validation failed for {upload_type} upload: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to upload {upload_type} image to Cloudinary: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Помилка під час завантаження зображення.")

# Функція видалення може просто прозоро викликати сервіс нижчого рівня
def delete_photo(public_id: str):
    try:
        CloudinaryService.delete_image(public_id)
    except Exception as e:
        # ... обробка помилок ...
        raise HTTPException(status_code=500)