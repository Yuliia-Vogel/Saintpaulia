from typing import List

from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from sqlalchemy.orm import Session

from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia import repository
from saintpaulia_app.saintpaulia.schemas import SaintpauliaCreate, SaintpauliaResponse
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
@router.get("/", response_model=List[SaintpauliaResponse])
def get_all_varieties(db: Session = Depends(get_db)):
    result = repository.get_all_varieties(db)
    if not result:
        raise HTTPException(status_code=404, detail="Сортів не знайдено.")
    return result


# Пошук за повною назвою - потрібен для виведення карток кожного сорту на фронтенді:
@router.get("/by-name/{name}", response_model=SaintpauliaResponse)
def get_variety_by_name(name: str, db: Session = Depends(get_db)):
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
@router.get("/search/", response_model=List[SaintpauliaResponse])
def search_varieties(name: str, db: Session = Depends(get_db)):
    result = repository.search_saintpaulias_by_name(name, db)
    if not result:
        raise HTTPException(status_code=404, detail="Сортів не знайдено.")
    return result


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