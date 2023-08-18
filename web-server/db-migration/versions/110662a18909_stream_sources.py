"""stream_sources

Revision ID: 110662a18909
Revises:
Create Date: 2023-08-11 19:17:45.268166

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '110662a18909'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'stream_sources',
        sa.Column('id', sa.Integer, primary_key = True),
        sa.Column('kind', sa.String(256), nullable=False),
        sa.Column('name', sa.String(256)),
        sa.Column('url', sa.String(256)),
        sa.Column('username', sa.String(256)),
        sa.Column('password', sa.String(256))
    )

    op.create_unique_constraint(
        'unique_stream_sources_name',
        'stream_sources', ['name']
    )

    op.create_unique_constraint(
        'unique_stream_sources_url',
        'stream_sources', ['url']
    )


def downgrade() -> None:
    op.drop_table('stream_sources')
