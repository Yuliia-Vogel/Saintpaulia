import logging

from typing import List, Optional
from fastapi import APIRouter, HTTPException, Depends, status, Query, Request
from sqlalchemy import select, distinct
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from saintpaulia_app.database import get_db
from saintpaulia_app.auth.dependencies import get_current_user
from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia.models import Saintpaulia
from saintpaulia_app.saintpaulia import repository
from saintpaulia_app.saintpaulia.schemas import SaintpauliaCreate, SaintpauliaResponse, PaginatedVarietyResponse, VerificationResponse, VerificationUpdate, VerificationBase
from saintpaulia_app.saintpaulia.models import SaintpauliaLog

router = APIRouter(tags=["Saintpaulia"])

logger = logging.getLogger(__name__)

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
@router.get("/by-id/{id}", response_model=SaintpauliaResponse)
def get_variety_by_id(id: int, db: Session = Depends(get_db)):
    result = repository.get_saintpaulia_by_id(id, db)
    if not result:
        raise HTTPException(status_code=404, detail="Сорт не знайдено")
    return result


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
def soft_delete_variety(name: str, 
                   current_user: User = Depends(get_current_user), 
                   db: Session = Depends(get_db)):
    success = repository.soft_delete_variety(name, current_user, db)
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

# роут для отримання даних для випадаючих списків на фронтенді
@router.get("/field-options")
async def get_field_options(db: Session = Depends(get_db)):
    try:
        return repository.get_field_options(db)
    except SQLAlchemyError as e:
        logger.error(f"Database error during field options fetch: {e}")
        raise HTTPException(status_code=500, detail="Помилка при отриманні даних з бази.")
    except Exception as e:
        logger.exception(f"Unexpected error during field options fetch: {e}")
        raise HTTPException(status_code=500, detail="Невідома помилка при обробці запиту.")


@router.get("/extended_search")
async def search_varieties(
    size_category: Optional[str] = None,
    flower_color: Optional[str] = None,
    flower_size: Optional[str] = None,
    flower_shape: Optional[str] = None,
    flower_doubleness: Optional[str] = None,
    ruffles: Optional[bool] = None,
    ruffles_color: Optional[str] = None,
    leaf_shape: Optional[str] = None,
    leaf_variegation: Optional[str] = None,
    selectionist: Optional[str] = None,
    selection_year: Optional[int] = None,
    origin: Optional[str] = None,
    db: Session = Depends(get_db),
    ):
    try:
        results = repository.extended_search(
            db,
            size_category,
            flower_color,
            flower_size,
            flower_shape,
            flower_doubleness,
            ruffles,
            ruffles_color,
            leaf_shape,
            leaf_variegation,
            selectionist,
            selection_year,
            origin,
        )
        response = {
            "items": results,
            "total": len(results),
            "message": "Сортів за цими критеріями не знайдено." if not results else None,
        }
        logger.info(f"Знайдено {len(results)} результатів.")
        return response
    except SQLAlchemyError as e:
        logger.error(f"Database error during extended search: {e}")
        raise HTTPException(status_code=500, detail="Помилка при виконанні запиту до бази.")
    except Exception as e:
        logger.exception(f"Unexpected error during extended search: {e}")
        raise HTTPException(status_code=500, detail="Невідома помилка під час обробки запиту.")
    

@router.get("/get_varieties_names")
async def get_varieties_names(db: Session = Depends(get_db)):
    try:
        names = repository.get_varieties_names(db)
        return {"total": len(names), "items": names}
    except SQLAlchemyError as e:
        logger.error(f"Database error during varieties names fetch: {e}")
        raise HTTPException(status_code=500, detail="Помилка при отриманні назв сортів з бази.")
    except Exception as e:
        logger.exception(f"Unexpected error during varieties names fetch: {e}")
        raise HTTPException(status_code=500, detail="Невідома помилка при обробці запиту.")
    
@router.get("/name_unique")
async def is_name_unique(name: str, db: Session = Depends(get_db)):
    try:
        is_unique = repository.is_name_unique(name, db)
        return {"is_unique": is_unique}
    except SQLAlchemyError as e:
        logger.error(f"Database error during name uniqueness check: {e}")
        raise HTTPException(status_code=500, detail="Помилка при перевірці унікальності назви.")
    except Exception as e:
        logger.exception(f"Unexpected error during name uniqueness check: {e}")
        raise HTTPException(status_code=500, detail="Невідома помилка при обробці запиту.")
    
    # Перевірка сорту адмінами
@router.put("/verify/{name}", response_model=VerificationResponse)
async def verify_variety_route(
    name: str,
    data: VerificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_role = current_user.role.value
    if user_role not in {"admin", "superadmin"}:
        raise HTTPException(status_code=403, detail="У вас немає прав для перевірки цього сорту.")

    try:
        updated_variety = repository.verify_variety(
            name=name,
            is_verified=data.is_verified,
            note=data.verification_note,
            current_user=current_user,
            db=db
        )
        if not updated_variety:
            raise HTTPException(status_code=404, detail="Сорт не знайдено або вже видалено.")

        return VerificationResponse(
            is_verified=updated_variety.is_verified,
            verified_by=updated_variety.verified_by,
            verification_date=updated_variety.verification_date,
            verification_note=updated_variety.verification_note
        )

    except SQLAlchemyError:
        raise HTTPException(status_code=500, detail="Помилка при перевірці сорту.")
    except Exception:
        raise HTTPException(status_code=500, detail="Невідома помилка при обробці запиту.")
