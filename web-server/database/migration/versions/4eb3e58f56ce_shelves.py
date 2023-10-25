"""shelves

Revision ID: 4eb3e58f56ce
Revises: 110662a18909
Create Date: 2023-10-03 14:42:28.086205

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4eb3e58f56ce'
down_revision: Union[str, None] = '110662a18909'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'shelf',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('kind', sa.Text),
        sa.Column('directory', sa.Text)
    )

    op.create_table(
        'video_file',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('path', sa.Text, nullable=False)
    )

    op.create_table(
        'tag',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False)
    )

    op.create_table(
        'movie',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'movie_tag',
        sa.Column('tag_id', sa.Integer, sa.ForeignKey('tag.id'), nullable=False, primary_key=True),
        sa.Column('movie_id', sa.Integer, sa.ForeignKey('movie.id'), nullable=False, primary_key=True),
    )

    op.create_table(
        'movie_video_file',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('movie_id', sa.Integer, sa.ForeignKey('movie.id'), nullable=False, primary_key=True),
        sa.Column('video_file_id', sa.Integer, sa.ForeignKey('video_file.id'), nullable=False, primary_key=True),
    )

    op.create_table(
        'show',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'show_tag',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('tag_id', sa.Integer, sa.ForeignKey('tag.id'), nullable=False, primary_key=True),
        sa.Column('show_id', sa.Integer, sa.ForeignKey('show.id'), nullable=False, primary_key=True),
    )

    op.create_table(
        'show_season',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'show_episode',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False)
    )

    op.create_table(
        'show_episode_video_file',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('show_episode_id', sa.Integer, sa.ForeignKey('show_episode.id'), nullable=False, primary_key=True),
        sa.Column('video_file_id', sa.Integer, sa.ForeignKey('video_file.id'), nullable=False, primary_key=True),
    )


def downgrade() -> None:
    op.drop_table('show_episode')
    op.drop_table('show_season')
    op.drop_table('movie')
    op.drop_table('movie_tag')
    op.drop_table('show')
    op.drop_table('show_tag')
    op.drop_table('tag')
    op.drop_table('video_file')
    op.drop_table('shelf')
