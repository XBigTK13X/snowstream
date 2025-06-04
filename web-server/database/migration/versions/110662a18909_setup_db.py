"""setup_db

Revision ID: 110662a18909
Revises:
Create Date: 2023-08-11 19:17:45.268166

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "110662a18909"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "stream_source",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("name", sa.Text),
        sa.Column("url", sa.Text),
        sa.Column("username", sa.Text),
        sa.Column("password", sa.Text),
    )
    op.create_unique_constraint("unique_stream_source_name", "stream_source", ["name"])
    op.create_unique_constraint("unique_stream_source_url", "stream_source", ["url"])

    op.create_table(
        "job",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("kind", sa.Text, nullable=False),
        sa.Column("message", sa.Text),
        sa.Column("status", sa.Text),
        sa.Column("logs_json", sa.Text),
        sa.Column("input_json", sa.Text)
    )

    op.create_table(
        "streamable",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "stream_source_id",
            sa.Integer,
            sa.ForeignKey("stream_source.id"),
            nullable=False,
        ),
        sa.Column("url", sa.Text, nullable=False),
        sa.Column("name", sa.Text, nullable=False),
    )

    op.create_table(
        "streamable_channel",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("parsed_id", sa.Text, nullable=False),
        sa.Column("parsed_name", sa.Text),
        sa.Column("parsed_number", sa.Float),
        sa.Column("edited_id", sa.Text),
        sa.Column("edited_name", sa.Text),
        sa.Column("edited_number", sa.Float),
    )

    op.create_unique_constraint(
        "unique_streamable_channel_parsed_id", "streamable_channel", ["parsed_id"]
    )

    op.create_table(
        "streamable_schedule",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column(
            "channel_id",
            sa.Integer,
            sa.ForeignKey("streamable_channel.id"),
            nullable=False,
        ),
        sa.Column("name", sa.Text, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("start_datetime", sa.DateTime),
        sa.Column("stop_datetime", sa.DateTime),
    )

    op.create_table(
        "cached_text",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("created_at", sa.DateTime, nullable=False),
        sa.Column("updated_at", sa.DateTime, nullable=False),
        sa.Column("time_to_live_seconds", sa.Integer, nullable=False),
        sa.Column("key", sa.Text, nullable=False),
        sa.Column("data", sa.Text, nullable=False),
    )


def downgrade() -> None:
    op.drop_table("streamable_schedule")
    op.drop_table("streamable_channel")
    op.drop_table("streamable")
    op.drop_table("job")
    op.drop_table("stream_source")
