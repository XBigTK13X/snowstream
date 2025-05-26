"""playing_queue

Revision ID: fabf20dd6a35
Revises: 29c169124c28
Create Date: 2025-05-25 21:38:10.011360

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fabf20dd6a35'
down_revision: Union[str, None] = '29c169124c28'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "playing_queue",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "client_device_user_id",
            sa.Integer,
            sa.ForeignKey("client_device_user.id"),
            nullable=False,
        ),
        sa.Column('source', sa.Text),
        sa.Column('content', sa.Text),
        sa.Column('progress', sa.Integer),
        sa.Column('length', sa.Integer)
    )

    op.create_unique_constraint(
        "unique_playing_queue_cduid_source",
        "playing_queue",
        ["client_device_user_id", "source"],
    )


def downgrade() -> None:
    pass
