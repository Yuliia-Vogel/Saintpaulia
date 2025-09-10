# admin_panel/repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload, Session
from fastapi import HTTPException
from typing import List

from saintpaulia_app.auth.models import User, UserRole
from saintpaulia_app.auth.schemas import UserOut
from saintpaulia_app.saintpaulia.models import Saintpaulia
from saintpaulia_app.saintpaulia.repository import log_action


async def get_user_by_id(user_id: int, db: AsyncSession) -> UserOut:
    result = db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_varieties_by_user(user_id: int, db: AsyncSession):
    result = db.execute(
        select(Saintpaulia)
        .options(joinedload(Saintpaulia.photos))
        .where(Saintpaulia.owner_id == user_id)
    )
    return result.scalars().unique().all()


async def get_all_users(db: AsyncSession):
    result = db.execute(select(User))
    return result.scalars().all()


async def update_user_role(user_id: int, new_role: str, db: AsyncSession):
    user = db.get(User, user_id)
    if not user:
        return None
    user.role = new_role
    db.commit()
    db.refresh(user)
    return user


async def delete_user(user_id: int, db: AsyncSession):
    user = db.get(User, user_id)
    if not user:
        return None
    db.delete(user)
    db.commit()
    return user


# повне видалення сорту адмінами
async def delete_variety(variety_id: int, db: AsyncSession, user: User):
    variety = db.get(Saintpaulia, variety_id)
    if not variety:
        return None
    log_action("final delete", variety, user, db) # логування дій над сортом 
    db.delete(variety)
    db.commit()
    
    return variety


def get_soft_deleted_varieties(db: AsyncSession):
    """
    Повертає список сортів, які були позначені як видалені (soft deleted).
    """
    return db.query(Saintpaulia).filter(Saintpaulia.is_deleted == True).all()


def bulk_restore_varieties(ids: List[int], user: User, db: Session) -> int:
    """Масово відновлює сорти за списком їх ID."""
    if user.role.value not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Дія доступна лише адміністраторам.")
    
    # Знаходимо всі сорти, ID яких є у наданому списку
    varieties_to_restore = db.query(Saintpaulia).filter(Saintpaulia.id.in_(ids)).all()
    
    if not varieties_to_restore:
        return 0 # Нічого не знайдено для відновлення

    for variety in varieties_to_restore:
        variety.is_deleted = False
        log_action("bulk restore", variety, user, db) # Логуємо кожну дію
    
    db.commit()
    return len(varieties_to_restore) # Повертаємо кількість відновлених сортів


def bulk_permanently_delete_varieties(ids: List[int], user: User, db: Session) -> int:
    """Масово остаточно видаляє сорти за списком їх ID."""
    if user.role.value not in ["admin", "superadmin"]:
        raise HTTPException(status_code=403, detail="Дія доступна лише адміністраторам.")

    varieties_to_delete = db.query(Saintpaulia).filter(Saintpaulia.id.in_(ids)).all()

    if not varieties_to_delete:
        return 0

    for variety in varieties_to_delete:
        log_action("bulk permanent_delete", variety, user, db) # Логуємо перед видаленням
        db.delete(variety)
    
    db.commit()
    return len(varieties_to_delete)