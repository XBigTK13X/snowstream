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
        sa.Column("last_connection", sa.DateTime, nullable=False),
        sa.Column("connected", sa.Boolean),
    )

    op.create_unique_constraint("unique_client_device_reported_name", "client_device", ["reported_name"])

    op.create_table(
        "user_activity",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("snowstream_user.id"),
            nullable=False,
        ),

        sa.Column(
            "client_device_id",
            sa.Integer,
            sa.ForeignKey("client_device.id"),
            nullable=False,
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

        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("progress_seconds", sa.Integer),
        sa.Column("only_affect_listed_device", sa.Boolean)
    )

    op.create_table(
        'user_watched_count',
        sa.Column(
            "user_id",
            sa.Integer,
            sa.ForeignKey("snowstream_user.id"),
            nullable=False,
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
        sa.Column('watched_count', sa.Integer)        
    )

def downgrade() -> None:
    pass
