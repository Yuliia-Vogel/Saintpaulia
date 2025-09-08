from fastapi import APIRouter, Depends, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession

from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from saintpaulia_app.photos.schemas import PhotoResponse
from saintpaulia_app.photos.service import process_photo_upload as service

router = APIRouter(tags=["Photos"])

@router.post("/upload", response_model=PhotoResponse)
async def upload_variety_photo(
    variety_id: int = Form(...),
    file: UploadFile = File(...),
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PhotoResponse:
    """
    Приймає запит на завантаження фото і передає його в сервісний шар для обробки.
    """
    # Вся складна логіка тепер в одній функції!
    # Роутер не хвилює, як вона працює. Він просто чекає на результат.
    # Якщо всередині сервісу виникне будь-яка помилка, її обробить або
    # сам сервіс (HTTPException), або наш глобальний обробник у main.py.
    
    new_photo = await service(
        variety_id=variety_id,
        file=file,
        current_user=current_user,
        session=session
    )

    return new_photo


@router.delete("/delete/{photo_id}", status_code=204)
async def delete_variety_photo(
    photo_id: int,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Видаляє фото за його ID.
    Логіка видалення в сервісному шарі.
    """
    from saintpaulia_app.photos.service import delete_photo as service

    await service(photo_id=photo_id, current_user=current_user, session=session)
    return None