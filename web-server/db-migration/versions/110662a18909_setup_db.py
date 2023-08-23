"""setup_db

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
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('kind', sa.String(256), nullable=False),
        sa.Column('name', sa.String(256)),
        sa.Column('url', sa.String(256)),
        sa.Column('username', sa.String(256)),
        sa.Column('password', sa.String(256)),
        sa.Column('remote_data', sa.Text)
    )
    op.create_unique_constraint(
        'unique_stream_sources_name',
        'stream_sources', ['name']
    )
    op.create_unique_constraint(
        'unique_stream_sources_url',
        'stream_sources', ['url']
    )

    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('kind', sa.String(256), nullable=False),
        sa.Column('message', sa.Text),
        sa.Column('status', sa.String(256))
    )

    op.create_table(
        'streamables',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('stream_source_id', sa.Integer, sa.ForeignKey('stream_sources.id'), nullable=False),
        sa.Column('url', sa.String(256), nullable=False),
        sa.Column('name', sa.String(256), nullable=False)
    )

    op.create_table(
        'streamable_channels',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('parsed_id', sa.String(256), nullable=False),
        sa.Column('parsed_name', sa.String(256)),
        sa.Column('parsed_number', sa.Float),
        sa.Column('edited_id', sa.String(256)),
        sa.Column('edited_name', sa.String(256)),
        sa.Column('edited_number', sa.Float)
    )

    op.create_unique_constraint(
        'unique_streamable_channels_parsed_id',
        'streamable_channels', ['parsed_id']
    )

    op.create_table(
        'streamable_schedules',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('channel_id', sa.Integer, sa.ForeignKey('streamable_channels.id'), nullable=False),
        sa.Column('name', sa.String(256), nullable=False),
        sa.Column('description', sa.Text),
        sa.Column('start_timestamp', sa.Integer),
        sa.Column('stop_timestamp', sa.Integer),
        sa.Column('start_datetime', sa.DateTime),
        sa.Column('stop_datetime', sa.DateTime)
    )


def downgrade() -> None:
    op.drop_table('streamable_schedules')
    op.drop_table('streamable_channels')
    op.drop_table('streamables')
    op.drop_table('jobs')
    op.drop_table('stream_sources')
