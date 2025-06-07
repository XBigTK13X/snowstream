"""shelves

Revision ID: 4eb3e58f56ce
Revises: 110662a18909
Create Date: 2023-10-03 14:42:28.086205

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4eb3e58f56ce"
down_revision: Union[str, None] = "110662a18909"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "shelf",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("kind", sa.Text),
        sa.Column("local_path", sa.Text),
        sa.Column("network_path", sa.Text),
    )

    op.create_unique_constraint("unique_shelf_local_path", "shelf", ["local_path"])
    op.create_unique_constraint("unique_shelf_network_path", "shelf", ["local_path"])

    op.create_table(
        "video_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("local_path", sa.Text, nullable=False),
        sa.Column("web_path", sa.Text, nullable=False),
        sa.Column("network_path", sa.Text, nullable=False),
        sa.Column("ffprobe_pruned_json", sa.Text, nullable=False),
        sa.Column("version", sa.Text, nullable=True),
        sa.Column("name", sa.Text, nullable=False)
    )

    op.create_unique_constraint("unique_video_file_local_path", "video_file", ["local_path"])
    op.create_unique_constraint("unique_video_file_web_path", "video_file", ["web_path"])
    op.create_unique_constraint("unique_video_file_network_path", "video_file", ["network_path"])

    op.create_table(
        "tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
    )

    op.create_unique_constraint("unique_tag_name", "tag", ["name"])

    op.create_table(
        "movie",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("release_year", sa.Integer),
        sa.Column("directory", sa.Text, nullable=True),
        sa.Column("remote_metadata_id", sa.Integer, nullable=True),
        sa.Column("remote_metadata_source", sa.Text, nullable=True),
    )

    op.create_table(
        "movie_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("movie_id", sa.Integer, sa.ForeignKey("movie.id"), nullable=False),
    )

    op.create_table(
        "movie_shelf",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("movie_id", sa.Integer, sa.ForeignKey("movie.id"), nullable=False),
    )

    op.create_unique_constraint(
        "unique_movie_shelf", "movie_shelf", ["shelf_id", "movie_id"]
    )

    op.create_table(
        "movie_video_file",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("movie_id", sa.Integer, sa.ForeignKey("movie.id"), nullable=False),
        sa.Column(
            "video_file_id", sa.Integer, sa.ForeignKey("video_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_movie_video_file", "movie_video_file", ["movie_id", "video_file_id"]
    )

    op.create_table(
        "show",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("release_year", sa.Integer),
        sa.Column("directory", sa.Text, nullable=False),
        sa.Column("remote_metadata_id", sa.Integer, nullable=True),
        sa.Column("remote_metadata_source", sa.Text, nullable=True),
    )

    op.create_table(
        "show_shelf",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("shelf_id", sa.Integer, sa.ForeignKey("shelf.id"), nullable=False),
        sa.Column("show_id", sa.Integer, sa.ForeignKey("show.id"), nullable=False),
    )

    op.create_unique_constraint(
        "unique_show_shelf", "show_shelf", ["shelf_id", "show_id"]
    )

    op.create_table(
        "show_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("show_id", sa.Integer, sa.ForeignKey("show.id"), nullable=False),
    )

    op.create_table(
        "show_season",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("show_id", sa.Integer, sa.ForeignKey("show.id"), nullable=False),
        sa.Column("name", sa.Text),
        sa.Column("directory", sa.Text, nullable=True),
        sa.Column("season_order_counter", sa.Integer, nullable=False),
    )

    op.create_table(
        "show_season_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("show_season_id", sa.Integer, sa.ForeignKey("show_season.id"), nullable=False),
    )

    op.create_table(
        "show_episode",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "show_season_id",
            sa.Integer,
            sa.ForeignKey("show_season.id"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=True),
        sa.Column("episode_order_counter", sa.Integer, nullable=False),
        sa.Column("episode_end_order_counter", sa.Integer,nullable=True)
    )

    op.create_table(
        "show_episode_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("show_episode_id", sa.Integer, sa.ForeignKey("show_episode.id"), nullable=False),
    )

    op.create_table(
        "show_episode_video_file",
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
            "video_file_id", sa.Integer, sa.ForeignKey("video_file.id"), nullable=False
        ),
    )

    op.create_unique_constraint(
        "unique_episode_video_file",
        "show_episode_video_file",
        ["show_episode_id", "video_file_id"],
    )

    op.create_table(
        "stream_source_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("stream_source_id", sa.Integer, sa.ForeignKey("stream_source.id"), nullable=False),
    )


    op.create_unique_constraint(
        "unique_stream_source_tag",
        "stream_source_tag",
        ["stream_source_id", "tag_id"],
    )

    op.create_table(
        "streamable_tag",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("tag_id", sa.Integer, sa.ForeignKey("tag.id"), nullable=False),
        sa.Column("streamable_id", sa.Integer, sa.ForeignKey("streamable.id"), nullable=False),
    )

    op.create_unique_constraint(
        "unique_streamable_tag",
        "streamable_tag",
        ["streamable_id", "tag_id"],
    )

def downgrade() -> None:
    op.drop_table("movie_video_file")
    op.drop_table("show_episode_video_file")
    op.drop_table("show_episode")
    op.drop_table("show_season")
    op.drop_table("movie")
    op.drop_table("movie_tag")
    op.drop_table("show")
    op.drop_table("show_tag")
    op.drop_table("tag")
    op.drop_table("video_file")
    op.drop_table("shelf")
