"""user_activity

Revision ID: 29c169124c28
Revises: afd0cd94a827
Create Date: 2025-01-30 11:02:30.448787

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '29c169124c28'
down_revision: Union[str, None] = 'afd0cd94a827'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "client_device",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("reported_name", sa.Text, nullable=False),
        sa.Column("display_name", sa.Text),
        sa.Column("device_kind", sa.Text),
    )

    op.create_unique_constraint("unique_client_device_reported_name", "client_device", ["reported_name"])
    op.create_unique_constraint("unique_client_device_display_name", "client_device", ["display_name"])

    op.create_table(
        "client_device_user",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "client_device_id",
            sa.Integer,
            sa.ForeignKey("client_device.id"),
            nullable=True,
        ),
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("snowstream_user.id"),
            nullable=True,
        ),
        sa.Column("isolation_mode", sa.Text),
        sa.Column("last_connection", sa.DateTime, nullable=False)
    )

    op.create_unique_constraint(
        "unique_client_device_user",
        "client_device_user",
        ["client_device_id","user_id"]
    )

    op.create_table(
        "watch_progress",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),

        sa.Column(
            "client_device_user_id",
            sa.Integer,
            sa.ForeignKey("client_device_user.id"),
            nullable=False,
        ),
        sa.Column(
            "movie_id",
            sa.Integer,
            sa.ForeignKey("movie.id"),
            nullable=True,
        ),
        sa.Column(
            "show_episode_id",
            sa.Integer,
            sa.ForeignKey("show_episode.id"),
            nullable=True,
        ),

        sa.Column(
            "streamable_id",
            sa.Integer,
            sa.ForeignKey("streamable.id"),
            nullable=True,
        ),
        sa.Column("played_seconds", sa.Float),
        sa.Column("duration_seconds", sa.Float)
    )

    op.create_table(
        'watch_count',
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "client_device_user_id",
            sa.Integer,
            sa.ForeignKey("client_device_user.id"),
            nullable=False,
        ),
        sa.Column(
            "movie_id",
            sa.Integer,
            sa.ForeignKey("movie.id"),
            nullable=True,
        ),
        sa.Column(
            "show_episode_id",
            sa.Integer,
            sa.ForeignKey("show_episode.id"),
            nullable=True,
        ),
        sa.Column(
            "streamable_id",
            sa.Integer,
            sa.ForeignKey("streamable.id"),
            nullable=True,
        ),
        sa.Column('amount', sa.Integer)
    )

    op.create_table(
        'watched',
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "client_device_user_id",
            sa.Integer,
            sa.ForeignKey("client_device_user.id"),
            nullable=False,
        ),
        sa.Column(
            "shelf_id",
            sa.Integer,
            sa.ForeignKey('shelf.id'),
            nullable=True
        ),
        sa.Column(
            "movie_id",
            sa.Integer,
            sa.ForeignKey("movie.id"),
            nullable=True,
        ),
        sa.Column(
            "show_id",
            sa.Integer,
            sa.ForeignKey("show.id"),
            nullable=True,
        ),
        sa.Column(
            "show_season_id",
            sa.Integer,
            sa.ForeignKey("show_season.id"),
            nullable=True,
        ),
        sa.Column(
            "show_episode_id",
            sa.Integer,
            sa.ForeignKey("show_episode.id"),
            nullable=True,
        ),
        sa.Column(
            "streamable_id",
            sa.Integer,
            sa.ForeignKey("streamable.id"),
            nullable=True,
        )
    )

    op.create_table(
        "transcode_session",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "client_device_user_id",
            sa.Integer,
            sa.ForeignKey("client_device_user.id"),
            nullable=True,
        ),
        sa.Column(
            "video_file_id",
            sa.Integer,
            sa.ForeignKey("video_file.id"),
            nullable=True,
        ),
        sa.Column(
            "streamable_id",
            sa.Integer,
            sa.ForeignKey("streamable.id"),
            nullable=True,
        ),
        sa.Column(
            "process_id",
            sa.Integer,
            nullable=True
        ),
        sa.Column(
            "stream_port",
            sa.Integer,
            nullable=True
        ),
        sa.Column(
            "transcode_directory",
            sa.Text,
            nullable=True
        ),
        sa.Column(
            "transcode_file",
            sa.Text,
            nullable=True
        )
    )

    op.create_unique_constraint(
        "unique_transcode_stream_port",
        "transcode_session",
        ["stream_port"]
    )

def downgrade() -> None:
    pass
