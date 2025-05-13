"""secondary-files

Revision ID: 51cb473947aa
Revises: 966a2f5fb91f
Create Date: 2024-03-18 21:47:17.311147

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "51cb473947aa"
down_revision: Union[str, None] = "966a2f5fb91f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("local_path", sa.Text, nullable=False),
        sa.Column("web_path", sa.Text, nullable=False),
        sa.Column("network_path", sa.Text, nullable=False),
        sa.Column("thumbnail_web_path", sa.Text, nullable=False),
    )

    op.create_unique_constraint("unique_image_file_local_path", "image_file", ["local_path"])
    op.create_unique_constraint("unique_image_file_web_path", "image_file", ["web_path"])
    op.create_unique_constraint("unique_image_file_network_path", "image_file", ["network_path"])

    op.create_table(
        "movie_image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("movie_id", sa.Integer, sa.ForeignKey("movie.id"), nullable=False),
        sa.Column(
            "image_file_id", sa.Integer, sa.ForeignKey("image_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_movie_image_file", "movie_image_file", ["movie_id", "image_file_id"]
    )

    op.create_table(
        "show_episode_image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "show_episode_id",
            sa.Integer,
            sa.ForeignKey("show_episode.id"),
            nullable=False,
        ),
        sa.Column(
            "image_file_id", sa.Integer, sa.ForeignKey("image_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_episode_image_file",
        "show_episode_image_file",
        ["show_episode_id", "image_file_id"],
    )

    op.create_table(
        "show_season_image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "show_season_id",
            sa.Integer,
            sa.ForeignKey("show_season.id"),
            nullable=False,
        ),
        sa.Column(
            "image_file_id", sa.Integer, sa.ForeignKey("image_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_season_image_file",
        "show_season_image_file",
        ["show_season_id", "image_file_id"],
    )

    op.create_table(
        "show_image_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("show_id", sa.Integer, sa.ForeignKey("show.id"), nullable=False),
        sa.Column(
            "image_file_id", sa.Integer, sa.ForeignKey("image_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_show_image_file", "show_image_file", ["show_id", "image_file_id"]
    )

    op.create_table(
        "metadata_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("local_path", sa.Text, nullable=False),
        sa.Column("web_path", sa.Text, nullable=False),
        sa.Column("network_path", sa.Text, nullable=False),
        sa.Column("xml_content", sa.Text, nullable=False),
    )

    op.create_unique_constraint("unique_metadata_file_local_path", "metadata_file", ["local_path"])
    op.create_unique_constraint("unique_metadata_file_web_path", "metadata_file", ["web_path"])
    op.create_unique_constraint("unique_metadata_file_network_path", "metadata_file", ["network_path"])

    op.create_table(
        "movie_metadata_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("movie_id", sa.Integer, sa.ForeignKey("movie.id"), nullable=False),
        sa.Column(
            "metadata_file_id",
            sa.Integer,
            sa.ForeignKey("metadata_file.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_movie_metadata_file",
        "movie_metadata_file",
        ["movie_id", "metadata_file_id"],
    )

    op.create_table(
        "show_episode_metadata_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "show_episode_id",
            sa.Integer,
            sa.ForeignKey("show_episode.id"),
            nullable=False,
        ),
        sa.Column(
            "metadata_file_id",
            sa.Integer,
            sa.ForeignKey("metadata_file.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_episode_metadata_file",
        "show_episode_metadata_file",
        ["show_episode_id", "metadata_file_id"],
    )

    op.create_table(
        "show_season_metadata_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "show_season_id",
            sa.Integer,
            sa.ForeignKey("show_season.id"),
            nullable=False,
        ),
        sa.Column(
            "metadata_file_id",
            sa.Integer,
            sa.ForeignKey("metadata_file.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_season_metadata_file",
        "show_season_metadata_file",
        ["show_season_id", "metadata_file_id"],
    )

    op.create_table(
        "show_metadata_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("show_id", sa.Integer, sa.ForeignKey("show.id"), nullable=False),
        sa.Column(
            "metadata_file_id",
            sa.Integer,
            sa.ForeignKey("metadata_file.id"),
            nullable=False,
        ),
    )

    op.create_unique_constraint(
        "unique_show_metadata_file",
        "show_metadata_file",
        ["show_id", "metadata_file_id"],
    )


def downgrade() -> None:
    op.drop_table("image_file")
    op.drop_table("metadata_file")
