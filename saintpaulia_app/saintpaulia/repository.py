# функції для роботи з базою даних
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, distinct, func
from typing import List, Optional, Dict, Set, Any

from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia.models import Saintpaulia, SaintpauliaLog
from saintpaulia_app.saintpaulia.schemas import SaintpauliaBase, SaintpauliaCreate, SaintpauliaResponse, SaintpauliaUpdate, SaintpauliaSearchCriteria


def log_action(action: str, variety: Saintpaulia, user: User, db: Session):
    if variety is None:
        raise ValueError("log_action called with variety=None")
    
    log_entry = SaintpauliaLog(
        action=action,
        variety_id=variety.id,
        variety_name=variety.name,
        user_id=user.id,
        timestamp=datetime.now(timezone.utc)
    )

    db.add(log_entry)
    db.commit()


def count_all_varieties(db: Session) -> int:
    return db.query(Saintpaulia).filter(Saintpaulia.is_deleted == False).count()


def create_saintpaulia_variety(body: SaintpauliaCreate, user: User, db: Session) -> Saintpaulia:
    """
    Creates a new Saintpaulia variety.

    :param body: The data for the Saintpaulia variety to create.
    :type body: SaintpauliaCreate
    :param user: The user to create the Saintpaulia variety.
    :type user: User
    :param db: The database session.
    :type db: Session
    :return: The newly created Saintpaulia variety.
    :rtype: Saintpaulia
    """
    # Перевірка ролі
    if user.role.value not in ["expert", "breeder", "admin", "superadmin"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Недостатньо прав для створення сорту."
            )
    
    data = body.dict()
    data["owner_id"] = user.id

    # Перевірка на унікальність
    exist_variety = db.query(Saintpaulia).filter(Saintpaulia.name == body.name).first()
    if exist_variety:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Сорт з назвою '{body.name}' вже існує."
        )
    new_variety = Saintpaulia(**data)
    db.add(new_variety)
    db.commit()
    db.refresh(new_variety) 
    log_action("create", new_variety, user, db) # логування дій над сортом 
    return new_variety 


def get_all_varieties(db: Session, 
                      limit: int = 10, 
                      offset: int = 0) -> List[Saintpaulia]:
    """
    Retrieves a list of all Saintpaulia varieties in database.

    :param db: The database session.
    :type db: Session
    :return: A list of Saintpaulia varieties.
    :rtype: List[Saintpaulia]
    """
    return (
        db.query(Saintpaulia)
        .filter(Saintpaulia.is_deleted == False)
        .order_by(func.lower(Saintpaulia.name).asc())
        .offset(offset).
        limit(limit).
        all()
    )

# Пошук сорту за точною назвою - використовується в функціях 'update_variety' та 'soft_delete_variety'
def get_saintpaulia_by_exact_name(name: str, db: Session) -> Optional[Saintpaulia] | None:
    """
    Retrieves a single Saintpaulia variety with the exact name. 
    For internal usage only: for repository functions 'update_variety' and 'soft_delete_variety'.

    :param name: The Saintpaulia variety name to retrieve.
    :type name: str
    :param db: The database session.
    :type db: Session
    :return: The Saintpaulia variety with the specified name, or None if it does not exist.
    :rtype: Saintpaulia | None
    """
    result = db.query(Saintpaulia).options(joinedload(Saintpaulia.verifier)).filter(Saintpaulia.name == name).first()
    return result


# Пошук сортів за частиною назви (нечіткий пошук)
def search_saintpaulias_by_name(name_part: str, 
                                db: Session, 
                                limit: int = 10, 
                                offset: int = 0) -> tuple[list[Saintpaulia], int]:
    """
    Retrieves a single Saintpaulia variety with the exact name.

    :param name_part: The Saintpaulia variety part of name to retrieve.
    :type name_part: str
    :param db: The database session.
    :type db: Session
    :return: The Saintpaulia variety list with the provided name part, or None if no one exists.
    :rtype: List [Saintpaulia] | None
    """
    query = db.query(Saintpaulia).options(joinedload(Saintpaulia.verifier)).filter(
        Saintpaulia.name.ilike(f"%{name_part}%"),
        Saintpaulia.is_deleted == False).order_by(func.lower(Saintpaulia.name).asc())
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


def update_variety(name: str, updated_data: SaintpauliaUpdate, user: User, db: Session) -> Optional[Saintpaulia]:
    """
    Updates a Saintpaulia variety by its exact name.

    :param name: The exact name of the Saintpaulia variety to update.
    :type name: str
    :param updated_data: A dictionary with the fields and new values to update.
    :type updated_data: dict
    :param user: Current user.
    :type user: User
    :param db: The database session.
    :type db: Session
    :return: The updated Saintpaulia variety if found, otherwise None.
    :rtype: Optional[Saintpaulia]
    """
    # Спочатку шукаємо потрібний сорт 
    variety = get_saintpaulia_by_exact_name(name, db)
    if not variety or variety.is_deleted:
        return None
    
    # Перевіряємо роль користувача, чи має він право на редагування сорту 
    if variety.owner_id != user.id and user.role.value not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="У вас немає прав для редагування цього сорту.")
    
    # Перетворюємо Pydantic-модель на словник.
    # exclude_unset=True - це КЛЮЧОВИЙ момент! Він включає в словник тільки ті поля, які були реально передані з фронтенду.
    update_dict = updated_data.dict(exclude_unset=True)

    # якщо раптом користувач не вніс рік селекції:
    for key in update_dict:
        if key == "selection_year" and update_dict[key] == "":
            update_dict[key] = None

    was_verified = variety.verification_status  # поточний статус сорту 
    need_reset_verification = False # перевірка, чи треба скидати верифікацію 

    # Перевірка: чи змінено хоча б одне ключове поле
    fields_to_check = [
        "name", "description", "size_category", "growth_type", "main_flower_color", "flower_color_type", 
        "flower_edge_color", "ruffles", "ruffles_color", "flower_colors_all", "flower_size", "flower_shape",
        "petals_shape", "flower_doubleness", "blooming_features",
        "leaf_shape", "leaf_variegation", "leaf_color_type", "leaf_features", 
        "origin", "breeder", "breeder_origin_country", "selection_year", "data_source"
    ]

    for field in fields_to_check:
        if field in update_dict and getattr(variety, field) != update_dict[field]:
            need_reset_verification = True
            break

    # Скидаємо верифікацію, якщо були зміни
    if was_verified and need_reset_verification:
        variety.verification_status = False
        variety.verified_by = None
        variety.verification_note = None
        variety.verification_date = None
        # updated_data.pop("verification_status", None)  # 🧽 не дозволяємо перезаписати поле "verification_status" вручну
        print("⚠️ Верифікацію скинуто через зміни у вмісті сорту")

    # Оновлення всіх змін
    for key, value in update_dict.items():
        if hasattr(variety, key):
            setattr(variety, key, value)

    db.commit()
    db.refresh(variety)
    log_action("update", variety, user, db)  # логування дій над сортом 
    return variety


# Видалення сорту
def soft_delete_variety(name: str, user: User, db: Session) -> bool:
    """
    Deletes a Saintpaulia variety by its exact name.

    :param name: The exact name of the Saintpaulia variety to delete.
    :type name: str
    :param db: The database session.
    :type db: Session
    :return: True if the variety was deleted, False if not found.
    :rtype: bool
    """
    variety = get_saintpaulia_by_exact_name(name, db)
    if not variety or variety.is_deleted:
        return False
    if variety.owner_id != user.id and user.role.value not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="У вас немає прав на видалення цього сорту.")

    variety.is_deleted = True
    db.commit()
    log_action("delete", variety, user, db)  # логування дій над сортом 
    return True


def get_varieties_by_user(db: Session, 
                          user_id: int, 
                          limit: int = 10, 
                          offset: int = 0) -> List[SaintpauliaResponse]:
    """
    Retrieves a list of Saintpaulia varieties for a specific user.

    :param db: The database session.
    :type db: Session
    :param user_id: The id of user whose varieties should be retrieved.
    :type user_id: int
    :return: A list of Saintpaulia varieties for specific user.
    :rtype: List[SaintpauliaResponse]
    """
    query = db.query(Saintpaulia).filter(
        Saintpaulia.owner_id == user_id, 
        Saintpaulia.is_deleted == False
        )
    total = query.count()
    print("Query count:", total)
    items = query.offset(offset).limit(limit).all()
    return items, total



def get_all_field_options(db: Session) -> Dict[str, List[str]]:
    """
    Дістає ВСІ унікальні та відсортовані опції для полів фільтрації.
    Список полів береться динамічно з моделі SaintpauliaSearchCriteria.
    """
     # 1. Визначаємо статичні опції, які не потрібно брати з бази
    static_options = { 
        # ТУТ ПІЗНІШЕ ДОДАТИ ЕНАМИ (!)
        # 'size_category': sorted([e.value for e in SizeCategoryEnum]),
        # 'flower_doubleness': sorted([e.value for e in FlowerDoublenessEnum]),
        # 'ruffles': sorted([e.value for e in RufflesTypesEnum])
    }

    options_map = static_options.copy() # Починаємо з наших статичних опцій

    # 2. Динамічно отримуємо список полів з Pydantic-моделі
    # `model_fields.keys()` дає нам імена всіх полів: 'size_category', 'breeder' і т.д.
    all_searchable_fields = SaintpauliaSearchCriteria.model_fields.keys()

    for field in all_searchable_fields:
        if field in options_map: # Якщо поле вже оброблено як статичне, пропускаємо його
            continue
        # Перевіряємо, чи є таке поле в моделі бази даних Saintpaulia
        if hasattr(Saintpaulia, field):
            column = getattr(Saintpaulia, field)
            
            db_result = db.execute(select(distinct(column))).scalars().all()

            unique_values: Set[Any] = set()
            for value in db_result:
                if value is None:
                    continue
                cleaned_value = str(value).strip()
                if cleaned_value and cleaned_value != '-':
                    unique_values.add(cleaned_value)
            
            # Додаємо в результат, тільки якщо є хоч одне значення
            if unique_values:
                options_map[field] = sorted(list(unique_values))

    return options_map


def extended_search(db: Session, criteria: SaintpauliaSearchCriteria) -> List[Saintpaulia]:
    """
    Виконує розширений пошук сортів на основі динамічних критеріїв,
    застосовуючи різну логіку для різних типів полів.
    """
    query = db.query(Saintpaulia)
    filters = criteria.dict(exclude_unset=True)

    # Список полів, де ми хочемо шукати за ЧАСТИННИМ входженням (підрядком)
    substring_search_fields = [
        "description", 
        "blooming_features", 
        "leaf_features", 
        "breeder", 
        "origin"
    ]

    for field, value in filters.items():
        if not value:
            continue

        if hasattr(Saintpaulia, field):
            column = getattr(Saintpaulia, field)

            # 1. Обробляємо ОСОБЛИВИЙ випадок: 'selection_year'
            # Йому потрібен точний числовий збіг.
            if field == "selection_year":
                query = query.filter(column == value)

            # 2. Обробляємо поля для гнучкого пошуку (за підрядком)
            elif field in substring_search_fields:
                query = query.filter(column.ilike(f"%{value}%"))

            # 3. Для ВСІХ ІНШИХ полів застосовуємо логіку за замовчуванням
            # Це буде точний збіг, але без урахування регістру (ідеально для категорій).
            else:
                query = query.filter(column.ilike(str(value)))

    return query.all()


def get_varieties_names(db: Session) -> List[str]:
    """
    Retrieves a list of all Saintpaulia variety names.

    :param db: The database session.
    :type db: Session
    :return: A list of Saintpaulia variety names.
    :rtype: List[str]
    """
    results = db.query(Saintpaulia.name).filter(Saintpaulia.is_deleted == False).all()
    names = [row[0].strip() for row in results if row[0]]
    return names


def is_name_unique(name: str, db: Session) -> bool:
    """
    Checks if a Saintpaulia variety name is unique.

    :param name: The name of the Saintpaulia variety to check.
    :type name: str
    :param db: The database session.
    :type db: Session
    :return: True if the name is unique, False if it already exists.
    :rtype: bool
    """
    normalized_name = name.strip().lower()
    existing_names = db.query(Saintpaulia.name).filter(Saintpaulia.is_deleted == False).all()
    normalized_existing_names = []
    for n in existing_names:
        normalized = n[0].strip().lower()
        normalized_existing_names.append(normalized)
    if normalized_name in normalized_existing_names:
        return False
    return True


def verify_variety(name: str, verification_status: bool, verification_note: Optional[str], current_user, db: Session):
    """
    Verifies or un-verifies a Saintpaulia variety by its exact name.

    :param name: The exact name of the Saintpaulia variety to verify.
    :type name: str
    :param verification_status: Boolean indicating whether to verify or un-verify the variety.
    :type verification_status: bool
    :param note: Optional note for the verification.
    :type note: Optional[str]
    :param current_user: The user performing the verification.
    :type current_user: User
    :param db: The database session.
    :type db: Session
    :return: The updated Saintpaulia variety if found, otherwise None.
    :rtype: Optional[Saintpaulia]
    """
    variety = get_saintpaulia_by_exact_name(name, db)
    if not variety or variety.is_deleted:
        return None

    variety.verification_status = verification_status
    variety.verification_note = verification_note
    variety.verified_by = current_user.id
    variety.verification_date = datetime.utcnow()

    db.commit()
    db.refresh(variety)

    log_action("verify", variety, current_user, db)

    return variety


def get_saintpaulia_by_id(id: int, db: Session) -> Optional[Saintpaulia]:
    """
    Retrieves a Saintpaulia variety by its ID.

    :param id: The ID of the Saintpaulia variety to retrieve.
    :type id: int
    :param db: The database session.
    :type db: Session
    :return: The Saintpaulia variety with the specified ID, or None if it does not exist.
    :rtype: Optional[Saintpaulia]
    """ 
    return db.query(Saintpaulia).options(joinedload(Saintpaulia.verifier)).filter(Saintpaulia.id == id, Saintpaulia.is_deleted == False).first()