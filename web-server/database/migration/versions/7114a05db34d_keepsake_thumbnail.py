"""keepsake_thumbnail

Revision ID: 7114a05db34d
Revises: 3ac6b58adfe2
Create Date: 2025-09-15 14:04:29.657100

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7114a05db34d'
down_revision: Union[str, None] = '3ac6b58adfe2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('video_file', sa.Column('thumbnail_web_path', sa.Text()))


def downgrade() -> None:
    pass
