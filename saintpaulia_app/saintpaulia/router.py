from typing import List

from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from sqlalchemy.orm import Session

from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia import repository
from saintpaulia_app.saintpaulia.schemas import SaintpauliaCreate, SaintpauliaResponse, PaginatedVarietyResponse
from saintpaulia_app.saintpaulia.models import SaintpauliaLog

router = APIRouter(prefix="/saintpaulias", tags=["Saintpaulias"])


# Створити новий сорт
@router.post("/", response_model=SaintpauliaResponse)
def create_variety(data: SaintpauliaCreate, 
                   db: Session = Depends(get_db), 
                   current_user: User = Depends(get_current_user)):
    print(data) # для відладки фронту   
    return repository.create_saintpaulia_variety(data, current_user, db)


# Отримати всі сорти
@router.get("/", response_model=PaginatedVarietyResponse)
def get_all_varieties(db: Session = Depends(get_db), 
                      limit: int = Query(10, ge=1, le=20),
                      offset: int = Query(0, ge=0)):
    total = repository.count_all_varieties(db)
    items = repository.get_all_varieties(db, limit=limit, offset=offset)
    if not items:
        raise HTTPException(status_code=404, detail="Сортів не знайдено.")
     # Перетворюємо ORM-обʼєкти у Pydantic-схеми
    serialized_items = [SaintpauliaResponse.from_orm(item) for item in items]
    # Повертаємо результат у форматі пагінації
    return {"items": serialized_items, "total": total}


# Пошук за повною назвою - потрібен для виведення карток кожного сорту на фронтенді:
@router.get("/by-name/{name}", response_model=SaintpauliaResponse)
def get_variety_by_name(name: str, 
                        db: Session = Depends(get_db)):
    result = repository.get_saintpaulia_by_exact_name(name, db)
    if not result:
        raise HTTPException(status_code=404, detail="Сорт не знайдено")
    return result

# Пошук за id - потім буде для виведення карток кожного сорту на фронтенді:
# @router.get("/by-id/{id}", response_model=SaintpauliaResponse)
# def get_variety_by_id(id: int, db: Session = Depends(get_db)):
#     result = repository.get_saintpaulia_by_id(id, db)
#     if not result:
#         raise HTTPException(status_code=404, detail="Сорт не знайдено")
#     return result


# Пошук за частиною назви
@router.get("/search/", response_model=PaginatedVarietyResponse)
def search_varieties(name: str, 
                     db: Session = Depends(get_db),
                     limit: int = Query(10, ge=1, le=20),
                     offset: int = Query(0, ge=0)):
    items, total = repository.search_saintpaulias_by_name(name, db, limit=limit, offset=offset)

    if total == 0:
        raise HTTPException(status_code=404, detail="Сортів не знайдено.")
    # Перетворюємо ORM-обʼєкти у Pydantic-схеми
    serialized_items = [SaintpauliaResponse.from_orm(item) for item in items]
    # Повертаємо результат у форматі пагінації
    return {"items": serialized_items, "total": total}


# Оновити дані про сорт
@router.put("/{name}", response_model=SaintpauliaResponse)
def update_variety(name: str, 
                   updated_data: dict,
                   db: Session = Depends(get_db), 
                   current_user: User = Depends(get_current_user)):
    updated = repository.update_variety(name, updated_data, current_user, db)
    if not updated:
        raise HTTPException(status_code=404, detail="Сорт не знайдено або видалено.")
    return updated


# Видалити сорт
@router.delete("/{name}")
def delete_variety(name: str, 
                   current_user: User = Depends(get_current_user), 
                   db: Session = Depends(get_db)):
    success = repository.delete_variety(name, current_user, db)
    if not success:
        raise HTTPException(status_code=404, detail="Сорт не знайдено або вже видалено.")
    return {"message": f"Сорт '{name}' успішно позначено як видалений."}


@router.get("/logs/")
def get_logs(db: Session = Depends(get_db), 
             current_user: User = Depends(get_current_user)):
    print("ROLE:", current_user.role, "| TYPE:", type(current_user.role))
    if current_user.role.value not in {"admin", "superadmin"}:
        raise HTTPException(status_code=403, detail="Доступ заборонено")

    return db.query(SaintpauliaLog).order_by(SaintpauliaLog.timestamp.desc()).all()


@router.get("/my-varieties/", response_model=PaginatedVarietyResponse)
def get_my_varieties(db: Session = Depends(get_db), 
                     current_user: User = Depends(get_current_user),
                     limit: int = Query(10, ge=1, le=20),
                     offset: int = Query(0, ge=0)):
    """
    Отримати сорти, які вніс поточний користувач.
    """
    items, total = repository.get_varieties_by_user(db, current_user.id, limit=limit, offset=offset)
    if not items:
        raise HTTPException(status_code=404, detail="Ваших сортів не знайдено.")
    # Перетворюємо ORM-обʼєкти у Pydantic-схеми
    serialized_items = [SaintpauliaResponse.from_orm(item) for item in items]
    # Повертаємо результат у форматі пагінації
    return {"items": serialized_items, "total": total}