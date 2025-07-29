"""streamable_group

Revision ID: e16b59725368
Revises: 1806469f3a64
Create Date: 2025-07-28 22:06:43.380600

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e16b59725368'
down_revision: Union[str, None] = '1806469f3a64'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('streamable', sa.Column('group', sa.Text(), nullable=True))


def downgrade() -> None:
    pass
