print("Початок імпорту photos.router")

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from photos.cloudinary_service import CloudinaryService
from saintpaulia_app.database import get_db
from auth.dependencies import get_current_user
from saintpaulia_app.saintpaulia.models import Saintpaulia
from photos.models import UploadedPhoto
from photos.schemas import PhotoResponce 
from photos.cloudinary_config import cloudinary as cl_service

print("Імпорти завершено")

router = APIRouter(tags=["Photos"])

print("Роутер photos створено")

@router.post("/upload") # якщо додати "response_model=PhotoResponce)", то падає завантаження фоток - треба розібратися, що там таке і чому
async def upload_variety_photo(
    variety_id: int = Form(...),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user)
):
    print("Функція upload_photo завантажена")
    # 1. Перевірка, що сорт існує
    result = session.execute(select(Saintpaulia).where(Saintpaulia.id == variety_id)) 
    variety = result.scalar_one_or_none()
    if not variety:
        raise HTTPException(status_code=404, detail="Saintpaulia variety not found")

    # 2. Перевірка прав доступу
    allowed_roles = ["admin", "superadmin"]
    if current_user.id != variety.owner_id and current_user.role.value not in allowed_roles:
        raise HTTPException(status_code=403, detail="You do not have permission to upload photo for this variety")

    # 3. Завантаження через сервіс
    try:
        upload_result = CloudinaryService.upload_image(file, current_user.email)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    file_url = upload_result["secure_url"]
    public_id = upload_result["public_id"]
    # 4. Збереження в БД
    photo = UploadedPhoto(
        file_url=file_url,
        public_id=public_id,
        variety_id=variety.id,
        uploaded_by=current_user.id
    )
    session.add(photo)
    session.commit()
    return {"file_url": file_url, "public_id": public_id}
