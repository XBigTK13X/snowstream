"""keepsake

Revision ID: 6ef651c842fa
Revises: fabf20dd6a35
Create Date: 2025-06-07 22:47:41.832906

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '6ef651c842fa'
down_revision: Union[str, None] = 'fabf20dd6a35'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "keepsake",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("directory", sa.Text, nullable=False),
    )

    op.create_unique_constraint("unique_keepsake_directory", "keepsake", ["directory"])

    op.create_table(
        "keepsake_shelf",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("keepsake_id", sa.Integer, sa.ForeignKey("keepsake.id"), nullable=False),
    )

    op.create_unique_constraint(
        "unique_keepsake_shelf", "keepsake_shelf", ["shelf_id", "keepsake_id"]
    )

    op.create_table(
        "keepsake_video_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("keepsake_id", sa.Integer, sa.ForeignKey("keepsake.id"), nullable=False),
        sa.Column(
            "video_file_id", sa.Integer, sa.ForeignKey("video_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_keepsake_video_file", "keepsake_video_file", ["keepsake_id", "video_file_id"]
    )

    op.create_table(
        "keepsake_image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("keepsake_id", sa.Integer, sa.ForeignKey("keepsake.id"), nullable=False),
        sa.Column(
            "image_file_id", sa.Integer, sa.ForeignKey("image_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_keepsake_image_file", "keepsake_image_file", ["keepsake_id", "image_file_id"]
    )

def downgrade() -> None:
    pass
