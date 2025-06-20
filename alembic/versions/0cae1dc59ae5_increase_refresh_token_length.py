"""Increase refresh_token length

Revision ID: 0cae1dc59ae5
Revises: 0fe6b8053aec
Create Date: 2025-06-19 16:22:53.363383

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0cae1dc59ae5'
down_revision: Union[str, None] = '0fe6b8053aec'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'users',
        'refresh_token',
        existing_type=sa.String(length=255),
        type_=sa.String(length=512),
        existing_nullable=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'users',
        'refresh_token',
        existing_type=sa.String(length=512),
        type_=sa.String(length=255),
        existing_nullable=True
    )
