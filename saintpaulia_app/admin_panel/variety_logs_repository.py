from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from saintpaulia_app.saintpaulia.models import SaintpauliaLog
from sqlalchemy.exc import SQLAlchemyError


async def fetch_variety_logs(variety_id: int, session: AsyncSession) -> list[SaintpauliaLog]:
    """
    Отримати журнали дій для конкретного сорту.
    """
    try:
        result = session.execute(
            select(SaintpauliaLog)
            .options(joinedload(SaintpauliaLog.user))
            .where(SaintpauliaLog.variety_id == variety_id)
            .order_by(SaintpauliaLog.timestamp.desc())
        )
        logs = result.scalars().all()
        return logs
    except SQLAlchemyError as e:
        print(f"Error fetching variety logs: {e}")
        return []
