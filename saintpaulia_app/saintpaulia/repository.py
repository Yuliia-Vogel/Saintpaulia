# функції для роботи з базою даних

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, distinct
from typing import List, Optional, Dict

from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia.models import Saintpaulia, SaintpauliaLog
from saintpaulia_app.saintpaulia.schemas import SaintpauliaBase, SaintpauliaCreate, SaintpauliaResponse


def log_action(action: str, variety_name: str, user: User, db: Session):
    log_entry = SaintpauliaLog(
        action=action,
        variety_name=variety_name,
        user_id=user.id
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
    log_action("create", new_variety.name, user, db) # логування дій над сортом 
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
        .offset(offset).
        limit(limit).
        all()
    )

# Пошук сорту за точною назвою - використовується в функціях 'update_variety' та 'delete_variety'
def get_saintpaulia_by_exact_name(name: str, db: Session) -> Optional[Saintpaulia] | None:
    """
    Retrieves a single Saintpaulia variety with the exact name. 
    For internal usage only: for repository functions 'update_variety' and 'delete_variety'.

    :param name: The Saintpaulia variety name to retrieve.
    :type name: str
    :param db: The database session.
    :type db: Session
    :return: The Saintpaulia variety with the specified name, or None if it does not exist.
    :rtype: Saintpaulia | None
    """
    result = db.query(Saintpaulia).filter(Saintpaulia.name == name).first()
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
    query = db.query(Saintpaulia).filter(
        Saintpaulia.name.ilike(f"%{name_part}%"),
        Saintpaulia.is_deleted == False)
    total = query.count()
    items = query.offset(offset).limit(limit).all()
    return items, total


# def get_variety_by_user(user: User, db: Session) -> List[Saintpaulia] | None:
#     """
#     Retrieves a list of Saintpaulia varieties for specific user.

#     :param user: The user whose varieties should be retrieved.
#     :type user: User
#     :param db: The database session.
#     :type db: Session
#     :return: A list of Saintpaulia varieties for specific user.
#     :rtype: List[Saintpaulia]
#     """
#     return db.query(Saintpaulia).filter(Saintpaulia.owner_id == user.id).all()


def update_variety(name: str, updated_data: dict, user: User, db: Session) -> Optional[Saintpaulia]:
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
    variety = get_saintpaulia_by_exact_name(name, db)
    if not variety or variety.is_deleted:
        return None
    
    print("👤 user.role.value:", user.role.value, type(user.role))
    if variety.owner_id != user.id and user.role.value not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="У вас немає прав для редагування цього сорту.")
    
    # якщо раптом користувач не вніс рік селекції:
    for key in updated_data:
        if key == "selection_year" and updated_data[key] == "":
            updated_data[key] = None

    for key, value in updated_data.items():
        if hasattr(variety, key):
            setattr(variety, key, value)

    db.commit()
    db.refresh(variety)
    log_action("update", variety.name, user, db)  # логування дій над сортом 
    return variety


# Видалення сорту
def delete_variety(name: str, user: User, db: Session) -> bool:
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
    if variety.owner_id != user.id and user.role not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="У вас немає прав на видалення цього сорту.")

    variety.is_deleted = True
    db.commit()
    log_action("delete", variety.name, user, db)  # логування дій над сортом 
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



def get_field_options(db: Session) -> Dict[str, List[str]]:
    fields = [
        "flower_color", "selectionist", "ruffles_color",
        "origin", "blooming_features", "selection_year"
    ]
    result = {}

    for field in fields:
        column = getattr(Saintpaulia, field)
        res = db.execute(select(distinct(column)))
        values = [r[0] for r in res if r[0] is not None]
        result[field] = sorted(values)

    return result


def extended_search(
    db: Session,
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
        ) -> List[Saintpaulia]:
    query = select(Saintpaulia).where(Saintpaulia.is_deleted == False)

    filters = {
        "size_category": size_category,
        "flower_color": flower_color,
        "flower_size": flower_size,
        "flower_shape": flower_shape,
        "flower_doubleness": flower_doubleness,
        "ruffles": ruffles,
        "ruffles_color": ruffles_color,
        "leaf_shape": leaf_shape,
        "leaf_variegation": leaf_variegation,
        "selectionist": selectionist,
        "selection_year": selection_year,
        "origin": origin,
    }

    for field, value in filters.items():
        if value is not None:
            query = query.where(getattr(Saintpaulia, field) == value)

    results = db.execute(query).scalars().all()
    return results


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


def verify_variety(name, is_verified, current_user, db):
    """
    Verifies or un-verifies a Saintpaulia variety by its exact name.

    :param name: The exact name of the Saintpaulia variety to verify.
    :type name: str
    :param is_verified: Boolean indicating whether to verify or un-verify the variety.
    :type is_verified: bool
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
    
    if current_user.role.value not in ["admin", "superadmin"]:
        return current_user.role.value
    
    variety.is_verified = is_verified
    db.commit()
    db.refresh(variety)
    
    log_action("verify", variety.name, current_user, db)  # логування дій над сортом 
    return variety