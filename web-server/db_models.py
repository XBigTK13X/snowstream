import sqlalchemy as sa
import sqlalchemy.orm as sorm
from typing import List

from database import BaseModel


class StreamSource(BaseModel):
    __tablename__ = "stream_sources"
    kind = sa.Column(sa.String)
    name = sa.Column(sa.String, unique=True)
    url = sa.Column(sa.String, unique=True)
    username = sa.Column(sa.String)
    password = sa.Column(sa.String)
    remote_data = sa.Column(sa.Text)
    streamables: sorm.Mapped[List["Streamable"]] = sorm.relationship(back_populates="stream_source")


class Job(BaseModel):
    __tablename__ = "jobs"
    kind = sa.Column(sa.String)
    message = sa.Column(sa.Text)
    status = sa.Column(sa.String)


class Streamable(BaseModel):
    __tablename__ = 'streamables'
    url = sa.Column(sa.String)
    name = sa.Column(sa.String)
    stream_source_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("stream_sources.id"))
    stream_source: sorm.Mapped["StreamSource"] = sorm.relationship(back_populates="streamables")


class StreamableChannel(BaseModel):
    __tablename__ = 'streamable_channels'
    parsed_id = sa.Column(sa.String)
    parsed_name = sa.Column(sa.String)
    parsed_number = sa.Column(sa.Float)
    edited_id = sa.Column(sa.String)
    edited_name = sa.Column(sa.String)
    edited_number = sa.Column(sa.Float)
    schedules: sorm.Mapped[List["StreamableSchedule"]] = sorm.relationship(back_populates="channel")


class StreamableSchedule(BaseModel):
    __tablename__ = 'streamable_schedules'
    name = sa.Column(sa.String)
    description = sa.Column(sa.String)
    start_datetime = sa.Column(sa.DateTime)
    stop_datetime = sa.Column(sa.DateTime)
    channel_id: sorm.Mapped[int] = sorm.mapped_column(sa.ForeignKey("streamable_channels.id"))
    channel: sorm.Mapped["StreamableChannel"] = sorm.relationship(back_populates="schedules")
