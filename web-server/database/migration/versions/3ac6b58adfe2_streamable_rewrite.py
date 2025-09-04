"""streamable_rewrite

Revision ID: 3ac6b58adfe2
Revises: e16b59725368
Create Date: 2025-09-04 14:27:55.165053

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3ac6b58adfe2'
down_revision: Union[str, None] = 'e16b59725368'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('streamable', sa.Column('name_display', sa.Text()))
    op.add_column('streamable', sa.Column('group_display', sa.Text()))
    op.create_table(
        "display_cleanup_rule",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("target_kind", sa.Text),
        sa.Column("rule_kind", sa.Text),
        sa.Column("priority", sa.Integer),
        sa.Column("needle", sa.Text),
        sa.Column("replacement", sa.Text),
    )

def downgrade() -> None:
    pass
