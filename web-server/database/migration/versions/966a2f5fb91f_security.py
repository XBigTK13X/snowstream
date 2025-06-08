"""security

Revision ID: 966a2f5fb91f
Revises: 4eb3e58f56ce
Create Date: 2023-11-14 13:22:03.665304

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "966a2f5fb91f"
down_revision: Union[str, None] = "4eb3e58f56ce"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "snowstream_user",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("username", sa.Text, nullable=False),
        sa.Column("display_name", sa.Text),
        sa.Column("hashed_password", sa.Text, nullable=True),
        sa.Column("has_password", sa.Boolean, default=False),
        sa.Column("enabled", sa.Boolean, default=True),
        sa.Column("permissions", sa.Text),
    )

    op.create_unique_constraint("unique_user_username", "snowstream_user", ["username"])

    # admin user
    # username: 'admin'
    # password: 'admin'
    op.execute(
        '''INSERT INTO snowstream_user
        (
            id,
            created_at,
            updated_at,
            username,
            display_name,
            hashed_password,
            has_password,
            enabled,
            permissions
        )
           VALUES
        (
            0,
            NOW(),
            NOW(),
            'admin',
            'admin',
            '$2b$12$Mm.mD4U2Ws7tyBeBwUXD7ehxZhH8RcClHkY.mi34VMGeQKAv98ek6',
            'true',
            'true',
            'admin'
        );'''
    )


def downgrade() -> None:
    op.drop_table("snowstream_user")
