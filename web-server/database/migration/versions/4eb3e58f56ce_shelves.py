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
        'shelves',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text)
    )

    op.create_table(
        'video_files',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('path', sa.Text, nullable=False)
    )

    op.create_table(
        'tags',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False)
    )

    op.create_table(
        'movies',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'movie_tags',
        sa.Column('tag_id', sa.Integer, sa.ForeignKey('tags.id'), nullable=False),
        sa.Column('movie_id', sa.Integer, sa.ForeignKey('movie.id'), nullable=False),
    )

    op.create_table(
        'shows',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'show_tags',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('tag_id', sa.Integer, sa.ForeignKey('tags.id'), nullable=False),
        sa.Column('show_id', sa.Integer, sa.ForeignKey('show.id'), nullable=False),
    )

    op.create_table(
        'show_seasons',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False),
        sa.Column('directory', sa.Text, nullable=False)
    )

    op.create_table(
        'show_episodes',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('name', sa.Text, nullable=False)
    )

    op.create_table(
        'show_episode_video_files',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('show_episode_id', sa.Integer, sa.ForeignKey('tags.id'), nullable=False),
        sa.Column('video_file_id', sa.Integer, sa.ForeignKey('show.id'), nullable=False),
    )

    op.create_table(
        'movie_video_files',
        sa.Column('id', sa.Integer, primary_key=True),
        sa.Column('created_at', sa.DateTime, nullable=False),
        sa.Column('updated_at', sa.DateTime, nullable=False),
        sa.Column('movie_id', sa.Integer, sa.ForeignKey('tags.id'), nullable=False),
        sa.Column('video_file_id', sa.Integer, sa.ForeignKey('show.id'), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('show_episodes')
    op.drop_table('show_seasons')
    op.drop_table('movies')
    op.drop_table('movie_tags')
    op.drop_table('shows')
    op.drop_table('show_tags')
    op.drop_table('tags')
    op.drop_table('video_files')
    op.drop_table('shelves')
