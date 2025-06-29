"""watched_granularity

Revision ID: 67d7ea3d7d59
Revises: 6ef651c842fa
Create Date: 2025-06-29 10:53:31.005299

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '67d7ea3d7d59'
down_revision: Union[str, None] = '6ef651c842fa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("watched","shelf_id")
    op.drop_column("watched","show_id")
    op.drop_column("watched","show_season_id")

def downgrade() -> None:
    pass
