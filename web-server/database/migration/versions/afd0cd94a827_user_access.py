"""user_access

Revision ID: afd0cd94a827
Revises: 51cb473947aa
Create Date: 2025-01-28 10:36:45.463780

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'afd0cd94a827'
down_revision: Union[str, None] = '51cb473947aa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "user_tag",
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
            "tag_id",
            sa.Integer,
            sa.ForeignKey("tag.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_user_tag",
        "user_tag",
        ["user_id", "tag_id"],
    )

    op.create_table(
        "user_shelf",
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
            "shelf_id",
            sa.Integer,
            sa.ForeignKey("shelf.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_user_shelf",
        "user_shelf",
        ["user_id", "shelf_id"],
    )

    op.create_table(
        "user_stream_source",
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
            "stream_source_id",
            sa.Integer,
            sa.ForeignKey("stream_source.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_user_stream_source",
        "user_stream_source",
        ["user_id", "stream_source_id"],
    )

def downgrade() -> None:
    pass
