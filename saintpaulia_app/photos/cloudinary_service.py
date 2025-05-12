import os
import cloudinary.uploader
from fastapi import UploadFile
from typing import ClassVar

CATEGORY_MAP = {
    "images": ["jpg", "jpeg", "png", "gif", "webp", "svg"],
}
FORBIDDEN_EXTENSIONS = ['.exe', '.bat', '.sh', '.php']
ALLOWED_IMAGE_EXTENSIONS = set(CATEGORY_MAP["images"])

class CloudinaryService:
    @classmethod
    def validate_file(cls, uploaded_file: UploadFile):
        file_name, file_extension = os.path.splitext(uploaded_file.filename)
        ext = file_extension.lower().lstrip(".")
        
        if file_extension.lower() in FORBIDDEN_EXTENSIONS:
            raise ValueError(f"Файл з розширенням {file_extension} заборонений.")

        if ext not in ALLOWED_IMAGE_EXTENSIONS:
            raise ValueError("До опису сорту завантажити можна лише зображення!")

    @classmethod
    def upload_image(cls, uploaded_file: UploadFile, user_email: str):
        cls.validate_file(uploaded_file)

        result = cloudinary.uploader.upload(
            uploaded_file.file,
            folder=f"saintpaulia_app/{user_email}",
            overwrite=False  # Не перезаписуємо існуючі файли
        )
        print("UPLOAD RESULT:", result)
        return result

    @classmethod
    def delete_image(cls, public_id: str):
        cloudinary.uploader.destroy(public_id)
