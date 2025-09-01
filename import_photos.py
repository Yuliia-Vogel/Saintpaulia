import sys
import os
from pathlib import Path
from typing import BinaryIO
from datetime import datetime

from sqlalchemy.orm import Session

# --- Ініціалізація конфігурації Cloudinary ---
# Цей імпорт має йти на початку, щоб завантажились змінні середовища та налаштувався клієнт cloudinary:
try:
    from saintpaulia_app.photos import cloudinary_config
except ImportError as e:
    print(f"❌ Помилка імпорту конфігурації Cloudinary: {e}")
    print("Переконайтесь, що скрипт запускається з кореневої папки проєкту.")
    sys.exit(1)

# --- Імпорти з мого додатку ---
from saintpaulia_app.database import SessionLocal
from saintpaulia_app.saintpaulia.models import Saintpaulia
from saintpaulia_app.photos.models import UploadedPhoto
from saintpaulia_app.auth.models import User
from saintpaulia_app.photos.cloudinary_service import CloudinaryService
from saintpaulia_app.photos.models import PhotoLog

# Допоміжний клас для імітації об'єкта UploadFile від FastAPI
class ScriptUploadFile:
    """
    Цей клас імітує UploadFile, щоб передати його у CloudinaryService.
    Він містить лише ті поля, які потрібні сервісу: `file` та `filename`.
    """
    def __init__(self, file: BinaryIO, filename: str):
        self.file = file
        self.filename = filename


def import_photos_for_varieties(folder_path: str):
    """
    Масово завантажує фото для сортів з локальної папки на Cloudinary
    та прив'язує їх до сортів у базі даних.

    Назва файлу (без розширення) має точно співпадати з назвою сорту в базі.
    """
    print(f"🔍 Пошук фотографій у папці: {folder_path}")

    # Підтримувані розширення файлів зображень
    image_extensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']

    # Збираємо список файлів зображень
    files_to_process = [p for p in Path(folder_path).glob('*') if p.suffix.lower() in image_extensions]

    if not files_to_process:
        print("❌ У вказаній папці не знайдено зображень.")
        return

    db: Session = SessionLocal()

    # Для сервісної функції потрібен об'єкт користувача.
    # Знаходимо першого користувача (адміна) для використання як власника фото.
    uploader_user_id = 1
    try:
        current_user = db.query(User).filter(User.id == uploader_user_id).first()
        if not current_user:
            print(f"❌ Не знайдено користувача з ID={uploader_user_id}. Неможливо встановити власника фото.")
            db.close()
            return
    except Exception as e:
        print(f"❌ Помилка при пошуку користувача: {e}")
        db.close()
        return

    print(f"👤 Фото будуть завантажені від імені користувача: {current_user.email} (ID: {current_user.id})")

    added_count = 0
    skipped_count = 0
    error_count = 0
    skipped_info = []
    error_info = []

    total_files = len(files_to_process)
    print(f"Знайдено {total_files} файлів для обробки.")

    # ЗНАХОДИМО "СИСТЕМНОГО" КОРИСТУВАЧА, ВІД ІМЕНІ ЯКОГО БУДУТЬ ЛОГИ
    system_user = db.query(User).filter(User.id == 1).first()
    if not system_user:
        system_user = db.query(User).filter(User.role == "superadmin").first()
        if not system_user:
            print("❌ Помилка: Користувач з ID=1 не знайдений у базі даних. Логування неможливе.")
            db.close()
            return

    for i, file_path in enumerate(files_to_process):
        variety_name = file_path.stem  # Назва файлу без розширення
        print(f"🔄 Обробка [{i+1}/{total_files}]: {file_path.name} (для сорту '{variety_name}')...")

        # 1. Знаходимо сорт в базі даних
        variety = db.query(Saintpaulia).filter(Saintpaulia.name == variety_name).first()

        if not variety:
            skipped_count += 1
            skipped_info.append(f"'{variety_name}' -> сорт не знайдено в базі")
            print(f"⏩ Пропущено: сорт не знайдено.")
            continue

        # 2. Перевіряємо, чи у сорту вже є фото
        if variety.photos:
            skipped_count += 1
            skipped_info.append(f"'{variety_name}' -> у сорту вже є фото")
            print(f"⏩ Пропущено: фото вже існує.")
            continue

        # 3. Завантажуємо фото, створюємо запис і лог
        try:
            with open(file_path, "rb") as file:
                # Створюємо імітацію UploadFile
                mock_upload_file = ScriptUploadFile(file=file, filename=file_path.name)

                # Викликаємо ваш сервіс для завантаження на Cloudinary
                cloudinary_result = CloudinaryService.upload_image(
                    uploaded_file=mock_upload_file,
                    user_email=current_user.email
                )

                # Створюємо запис у нашій базі даних
                new_photo = UploadedPhoto(
                    file_url=cloudinary_result['secure_url'],
                    public_id=cloudinary_result['public_id'],
                    variety_id=variety.id,
                    uploaded_by=current_user.id
                )
                db.add(new_photo)
                db.flush()  # щоб отримати ID фото для логування
                log = PhotoLog(
                    photo_id=new_photo.id,
                    variety_id=new_photo.variety_id,
                    user_id=current_user.id,
                    action="bulk photo upload",
                    timestamp=datetime.utcnow()
                )
                db.add(log)

            added_count += 1
            print(f"✅ Успішно завантажено '{variety_name}'.")

        except Exception as e:
            error_count += 1
            error_info.append(f"'{variety_name}' -> помилка: {e}")
            print(f"❌ ПОМИЛКА: {e}")

    # --- Зберігаємо ВСІ зміни в базі ОДНИМ ЗАПИТОМ ---
    try:
        print("\n💾 Збереження всіх змін у базі даних...")
        db.commit() # 2. РОБИМО ОДИН КОМІТ ПІСЛЯ ЗАВЕРШЕННЯ ЦИКЛУ
        print("🎉 Всі зміни успішно збережено!")
    except Exception as e:
        print(f"❌ Критична помилка під час збереження в базу: {e}")
        db.rollback()
        print("🔄 Всі зміни було скасовано.")
    finally:
        db.close()

    # --- Логування результатів ---
    print("\n" + "="*30)
    print("РЕЗУЛЬТАТ ЗАВАНТАЖЕННЯ ФОТО")
    print("="*30)
    print(f"Всього файлів у папці: {total_files}")
    print(f"✅ Успішно завантажено: {added_count}")
    print(f"⏩ Пропущено: {skipped_count}")
    print(f"❌ Помилок: {error_count}")

    if skipped_info:
        print("\n--- Пропущені файли ---")
        for info in skipped_info:
            print(f" - {info}")

    if error_info:
        print("\n--- Файли з помилками ---")
        for info in error_info:
            print(f" - {info}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("\nВикористання: python import_photos.py <шлях_до_папки_з_фото>")
        print("Приклад: python import_photos.py \"/home/user/Desktop/Variety Photos\"")
        sys.exit(1) 

    folder = sys.argv[1]
    if not os.path.isdir(folder):
        print(f"\nПомилка: '{folder}' не є папкою або не існує.")
        sys.exit(1)

    import_photos_for_varieties(folder)