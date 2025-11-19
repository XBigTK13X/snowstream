"""tag_rule

Revision ID: b072f720350b
Revises: da8f207387b8
Create Date: 2025-11-18 21:51:42.498337

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b072f720350b'
down_revision: Union[str, None] = 'da8f207387b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tag_rule",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "tag_id",
            sa.Integer,
            sa.ForeignKey("tag.id"),
            nullable=True,
        ),
        sa.Column("rule_kind", sa.Text),
        sa.Column("priority", sa.Integer),
        sa.Column("target_kind", sa.Text),
        sa.Column("trigger_kind", sa.Text),
        sa.Column("trigger_target", sa.Text),
    )


def downgrade() -> None:
    pass
