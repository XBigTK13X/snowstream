"""episode_guide

Revision ID: da8f207387b8
Revises: 7114a05db34d
Create Date: 2025-09-15 16:36:32.351910

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'da8f207387b8'
down_revision: Union[str, None] = '7114a05db34d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_table('streamable_schedule')
    op.drop_table('streamable_channel')

    op.create_table(
        "channel_guide_source",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("name", sa.Text),
        sa.Column("url", sa.Text),
        sa.Column("username", sa.Text),
        sa.Column("password", sa.Text),
    )
    op.create_unique_constraint("unique_channel_guide_source_name", "channel_guide_source", ["name"])
    op.create_unique_constraint("unique_channel_guide_source_url", "channel_guide_source", ["url"])

    op.create_table(
        "channel",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "channel_guide_source_id",
            sa.Integer,
            sa.ForeignKey("channel_guide_source.id",ondelete='cascade'),
            nullable=False,
        ),
        sa.Column("parsed_id", sa.Text, nullable=False),
        sa.Column("parsed_name", sa.Text),
        sa.Column("parsed_number", sa.Float),
        sa.Column("edited_id", sa.Text),
        sa.Column("edited_name", sa.Text),
        sa.Column("edited_number", sa.Float),
    )

    op.create_unique_constraint(
        "unique_channel_parsed_id", "channel", ["parsed_id"]
    )

    op.create_table(
        "channel_program",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "channel_id",
            sa.Integer,
            sa.ForeignKey("channel.id",ondelete='cascade'),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("start_datetime", sa.DateTime),
        sa.Column("stop_datetime", sa.DateTime),
    )

    op.create_table(
        "streamable_channel",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "streamable_id",
            sa.Integer,
            sa.ForeignKey("streamable.id",ondelete='cascade'),
            nullable=False,
        ),
        sa.Column(
            "channel_id",
            sa.Integer,
            sa.ForeignKey("channel.id",ondelete='cascade'),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_streamable_channel",
        "streamable_channel",
        ["streamable_id", "channel_id"],
    )


def downgrade() -> None:
    pass
