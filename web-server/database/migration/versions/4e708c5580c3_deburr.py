"""deburr

Revision ID: 4e708c5580c3
Revises: b072f720350b
Create Date: 2026-04-04 15:22:21.784517

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e708c5580c3'
down_revision: Union[str, None] = 'b072f720350b'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS unaccent")


def downgrade() -> None:
    pass
