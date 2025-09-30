import os
import cloudinary.uploader
from fastapi import UploadFile
from typing import Set

import saintpaulia_app.photos.cloudinary_config  # Імпортуємо, щоб конфігурація застосувалась


FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.sh', '.php']
DEFAULT_ALLOWED_IMAGE_EXTENSIONS = {"jpg", "jpeg", "png", "gif", "webp", "svg"}

class CloudinaryService:
    @classmethod
    def validate_file(cls, 
                      uploaded_file: UploadFile,
                      allowed_extensions: Set[str], 
                      error_message: str):
        """
        Універсальний валідатор файлів.
        :param uploaded_file: Файл для перевірки.
        :param allowed_extensions: Множина дозволених розширень (напр., {'jpg', 'png'}).
        :param error_message: Повідомлення про помилку, якщо розширення не підходить.
        """
        _file_name, file_extension = os.path.splitext(uploaded_file.filename)
        ext_lower = file_extension.lower()
        
        if ext_lower in FORBIDDEN_EXTENSIONS:
            raise ValueError(f"Файл з розширенням {file_extension} заборонений.")

        if ext_lower.lstrip(".") not in allowed_extensions:
            raise ValueError(error_message)


    @classmethod
    def upload_image(cls, 
                     file: UploadFile, 
                     user_email: str,
                     folder: str) -> dict:
        """
        Універсальний завантажувач зображень.
        :param file: Об'єкт файлу.
        :param user_email: Email для ідентифікації.
        :param folder: Конкретна папка на Cloudinary (напр., 'avatars' або 'varieties').
        """
        # Створюємо більш організовану структуру папок
        full_folder_path = f"saintpaulia_app/{folder}/{user_email}"
        result = cloudinary.uploader.upload(
            file,
            folder=full_folder_path,
            overwrite=False  # Для аватарів краще перезаписувати - вказувати overwrite=True, для сортів можна залишити False
        )
        print("UPLOAD RESULT:", result)
        return result

    @classmethod
    def delete_image(cls, public_id: str):
        cloudinary.uploader.destroy(public_id)