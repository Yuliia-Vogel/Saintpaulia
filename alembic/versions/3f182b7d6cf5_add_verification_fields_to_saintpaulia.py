"""Add verification  fields to Saintpaulia

Revision ID: 3f182b7d6cf5
Revises: 042c0c2d37f1
Create Date: 2025-08-13 15:41:56.968969

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3f182b7d6cf5'
down_revision: Union[str, None] = '042c0c2d37f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1) Задати дефолт на рівні БД для нових рядків
    op.alter_column(
        'saintpaulia_varieties',
        'verification_status',
        server_default=sa.text('false')
    )

    # 2) Заповнити існуючі NULL значенням FALSE
    op.execute(
        "UPDATE saintpaulia_varieties "
        "SET verification_status = FALSE "
        "WHERE verification_status IS NULL;"
    )

    # 3) Тепер можна зробити NOT NULL
    op.alter_column(
        'saintpaulia_varieties',
        'verification_status',
        existing_type=sa.Boolean(),
        nullable=False
    )
    # ### end Alembic commands ###


def downgrade() -> None:
    # Зняти NOT NULL
    op.alter_column(
        'saintpaulia_varieties',
        'verification_status',
        nullable=True
    )
    # Прибрати server default
    op.alter_column(
        'saintpaulia_varieties',
        'verification_status',
        server_default=None
    )
    # ### end Alembic commands ###
