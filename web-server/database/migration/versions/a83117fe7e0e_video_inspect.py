"""video_inspect

Revision ID: a83117fe7e0e
Revises: 67d7ea3d7d59
Create Date: 2025-07-07 08:39:08.075506

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a83117fe7e0e'
down_revision: Union[str, None] = '67d7ea3d7d59'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column('video_file', 'ffprobe_pruned_json')
    op.add_column('video_file', sa.Column('snowstream_info_json', sa.Text()))
    op.add_column('video_file', sa.Column('ffprobe_raw_json', sa.Text()))
    op.add_column('video_file', sa.Column('mediainfo_raw_json', sa.Text()))

def downgrade() -> None:
    pass
