from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import UploadFile 
import re

from saintpaulia_app.auth.models import User
from saintpaulia_app.photos import service as photo_service


class Hash:
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

    def verify_password(self, plain_password, hashed_password):
        return self.pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str):
        return self.pwd_context.hash(password)
    

def _get_public_id_from_url(url: str) -> str | None:
    """Витягує public_id з URL Cloudinary для подальшого видалення."""
    # Приклад URL: .../upload/v12345/saintpaulia_app/user_avatars/email/filename.jpg
    # Нам потрібна частина після '.../upload/'
    match = re.search(r'upload/(?:v\d+/)?(.+?)(?:\.\w+)?$', url)
    if match:
        return match.group(1)
    return None


def update_user_avatar(current_user: User, file: UploadFile, db: Session) -> User:
    """
    Оновлює аватар користувача з видаленням старого.
    """
    # 1. Перевіряємо, чи є старий аватар, і видаляємо його
    if current_user.avatar_url:
        old_public_id = _get_public_id_from_url(current_user.avatar_url)
        if old_public_id:
            photo_service.delete_photo(old_public_id)

    # 2. Завантажуємо новий аватар через універсальний сервіс
    upload_result = photo_service.upload_photo(
        file=file, 
        user_email=current_user.email, 
        upload_type='avatar'
    )
    
    # 3. Оновлюємо URL аватара в профілі
    current_user.avatar_url = upload_result["secure_url"]
    db.commit()
    db.refresh(current_user)
    
    return current_user