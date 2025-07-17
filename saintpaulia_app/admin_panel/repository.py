# admin_panel/repository.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from saintpaulia_app.auth.models import User
from saintpaulia_app.saintpaulia.models import Saintpaulia


async def get_user_by_id(user_id: int, db: AsyncSession) -> User:
    result = db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def get_varieties_by_user(user_id: int, db: AsyncSession):
    result = db.execute(
        select(Saintpaulia).where(Saintpaulia.owner_id == user_id)
    )
    return result.scalars().all()
