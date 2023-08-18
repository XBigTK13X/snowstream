"""jobs

Revision ID: c84ea7da07bf
Revises: 110662a18909
Create Date: 2023-08-17 22:09:21.582861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c84ea7da07bf'
down_revision: Union[str, None] = '110662a18909'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'jobs',
        sa.Column('id', sa.Integer, primary_key = True),
        sa.Column('kind', sa.String(256), nullable=False),
        sa.Column('message', sa.String(256)),
        sa.Column('status', sa.String(256))
    )


def downgrade() -> None:
    op.drop_table('jobs')
